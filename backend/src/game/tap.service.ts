import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Round } from '@ThLOG/round/entities/round.entity';
import { RoundParticipation } from '@ThLOG/round/entities/round-participations.entity';
import { User, UserRole } from '@ThLOG/auth/entities';
import { TapLog } from '@ThLOG/game/entitties/tap-log.entity';
import { PostgresLockService } from '@ThLOG/lock/postgres-lock.service';
import { RedisCacheService } from '@ThLOG/redis/redis-cache.service';

export interface TapResult {
  userId: string;
  roundId: string;
  taps: number;
  score: number;
  pointsEarned: number;
  message?: string;
}

export interface RoundStatsUpdate {
  roundId: string;
  totalScore: number;
  totalTaps: number;
  leaderboard: Array<{
    userId: string;
    username: string;
    taps: number;
    score: number;
  }>;
}

@Injectable()
export class TapService {
  private readonly logger = new Logger(TapService.name);

  constructor(
    @InjectRepository(Round)
    private readonly roundRepository: Repository<Round>,
    @InjectRepository(RoundParticipation)
    private readonly participationRepository: Repository<RoundParticipation>,
    @InjectRepository(TapLog)
    private readonly tapLogRepository: Repository<TapLog>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly lockService: PostgresLockService,
    private readonly cacheService: RedisCacheService,
  ) {
    // Запускаем фоновую задачу для обработки журнала кликов
    this.scheduleStatsCalculationWithLock();
  }

  // Запись клика в журнал (быстрая операция)
  async recordTap(userId: string, roundId: string): Promise<TapResult> {
    try {
      // Проверяем активность раунда (кэшируем результат)
      const roundKey = `round:${roundId}`;
      const round = await this.cacheService.getOrSet<Round | null>(
        roundKey,
        () => this.roundRepository.findOne({ where: { id: roundId } }),
        30, // TTL 30 секунд
      );

      if (!round) {
        throw new BadRequestException('Раунд не найден');
      }

      const now = new Date();
      if (now < round.startTime) {
        throw new BadRequestException('Раунд еще не начался');
      }
      if (now > round.endTime) {
        throw new BadRequestException('Раунд уже завершен');
      }

      // Проверяем роль пользователя (кэшируем результат)
      const userKey = `user:${userId}`;
      const user = await this.cacheService.getOrSet<User | null>(
        userKey,
        () => this.userRepository.findOne({ where: { id: userId } }),
        300, // TTL 5 минут для пользователя
      );

      if (!user) {
        throw new BadRequestException('Пользователь не найден');
      }

      const isNikita = user.role === UserRole.NIKITA;

      // Получаем текущую статистику пользователя
      const statsKey = `stats:${userId}:${roundId}`;
      const userStats = await this.cacheService.getOrSet<{
        taps: number;
        score: number;
      }>(
        statsKey,
        () => this.getUserStats(userId, roundId),
        10, // TTL 10 секунд
      );

      // Определяем, сколько очков начислить
      let pointsToAdd = 1;
      // Каждый 11-й клик дает 10 очков
      if ((userStats.taps + 1) % 11 === 0) {
        pointsToAdd = 10;
      }

      // Если пользователь - Никита, очки не начисляются
      const actualPointsToAdd = isNikita ? 0 : pointsToAdd;

      // Создаем запись в журнале
      const tapLog = this.tapLogRepository.create({
        userId,
        roundId,
        timestamp: now,
        pointsEarned: actualPointsToAdd,
      });

      // Сохраняем запись в журнале
      await this.tapLogRepository.save(tapLog);

      // Обновляем кэш статистики пользователя (инвалидируем)
      await this.cacheService.del(statsKey);

      // Возвращаем результат
      return {
        userId,
        roundId,
        taps: userStats.taps + 1,
        score: userStats.score + actualPointsToAdd,
        pointsEarned: actualPointsToAdd,
        message: isNikita
          ? 'Клик засчитан, но очки не начислены (роль Никита)'
          : undefined,
      };
    } catch (error) {
      this.logger.error(
        `Ошибка при записи клика: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  // Периодический запуск расчета статистики с блокировкой
  private scheduleStatsCalculationWithLock() {
    setInterval(async () => {
      // Пытаемся получить блокировку для фоновой задачи
      const hasLock = await this.lockService.acquireLock(
        'stats_calculation',
        30000,
      );

      if (hasLock) {
        try {
          // Только один сервер выполнит этот код
          await this.calculateStatsFromLogs();
        } catch (error) {
          this.logger.error(
            `Ошибка при расчете статистики: ${error.message}`,
            error.stack,
          );
        } finally {
          // Освобождаем блокировку в любом случае
          await this.lockService.releaseLock('stats_calculation');
        }
      }
    }, 10000); // Каждые 10 секунд
  }

  // Расчет статистики из журнала кликов
  private async calculateStatsFromLogs(): Promise<void> {
    // Получаем список активных раундов
    const activeRounds = await this.roundRepository.find({
      where: [
        {
          startTime: LessThanOrEqual(new Date()),
          endTime: MoreThanOrEqual(new Date()),
        },
        { endTime: LessThanOrEqual(new Date()), calculationComplete: false },
      ],
    });

    for (const round of activeRounds) {
      // Для каждого раунда пытаемся получить блокировку
      const lockKey = `round_stats:${round.id}`;
      const hasLock = await this.lockService.acquireLock(lockKey, 30000);

      if (hasLock) {
        try {
          await this.calculateRoundStats(round.id);

          // Если раунд завершен, помечаем его как полностью рассчитанный
          if (round.endTime < new Date()) {
            round.calculationComplete = true;
            await this.roundRepository.save(round);

            // Инвалидируем кэш для завершенного раунда
            await this.cacheService.del(`round:${round.id}`);
          }
        } catch (error) {
          this.logger.error(
            `Ошибка при расчете статистики раунда ${round.id}: ${error.message}`,
            error.stack,
          );
        } finally {
          await this.lockService.releaseLock(lockKey);
        }
      }
    }
  }

  // Расчет статистики для конкретного раунда
  private async calculateRoundStats(roundId: string): Promise<void> {
    // Используем транзакцию для обеспечения консистентности
    await this.dataSource.transaction(async (manager) => {
      // Получаем всех пользователей, которые участвовали в раунде
      const userIds = await manager
        .createQueryBuilder()
        .select('DISTINCT "userId"')
        .from(TapLog, 'tap')
        .where('tap.roundId = :roundId', { roundId })
        .getRawMany()
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        .then((results) => results.map((r) => r.userId));

      // Для каждого пользователя рассчитываем статистику
      for (const userId of userIds) {
        await this.calculateUserStats(manager, userId, roundId);
      }

      // Инвалидируем кэш статистики раунда
      await this.cacheService.del(`round_stats:${roundId}`);
      await this.cacheService.del(`round_leaderboard:${roundId}`);
    });
  }

  // Расчет статистики пользователя
  private async calculateUserStats(
    manager: any,
    userId: string,
    roundId: string,
  ): Promise<void> {
    // Получаем все клики пользователя
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const taps = await manager.find(TapLog, {
      where: { userId, roundId },
      order: { timestamp: 'ASC' },
    });

    // Проверяем роль пользователя
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const user = await manager.findOne(User, { where: { id: userId } });
    const isNikita = user?.role === UserRole.NIKITA;

    // Считаем статистику
    const totalTaps = taps.length;
    let totalScore = 0;

    for (let i = 0; i < totalTaps; i++) {
      // Правило начисления очков
      const points = (i + 1) % 11 === 0 ? 10 : 1;

      // Обновляем pointsEarned в записи, если нужно
      if (taps[i].pointsEarned === 0) {
        taps[i].pointsEarned = isNikita ? 0 : points;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        await manager.save(taps[i]);
      }

      // Если пользователь не Никита, считаем очки
      if (!isNikita) {
        totalScore += taps[i].pointsEarned;
      }
    }

    // Обновляем запись участия
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    let participation = await manager.findOne(RoundParticipation, {
      where: { userId, roundId },
    });

    if (!participation) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      participation = manager.create(RoundParticipation, {
        userId,
        roundId,
        taps: 0,
        score: 0,
      });
    }

    participation.taps = totalTaps;
    participation.score = totalScore;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await manager.save(participation);

    // Инвалидируем кэш пользователя
    await this.cacheService.del(`stats:${userId}:${roundId}`);
  }

  // Получение статистики пользователя
  async getUserStats(
    userId: string,
    roundId: string,
  ): Promise<{ taps: number; score: number }> {
    const cacheKey = `stats:${userId}:${roundId}`;

    return this.cacheService.getOrSet<{ taps: number; score: number }>(
      cacheKey,
      async () => {
        const participation = await this.participationRepository.findOne({
          where: { userId, roundId },
        });

        if (!participation) {
          return { taps: 0, score: 0 };
        }

        return {
          taps: participation.taps,
          score: participation.score,
        };
      },
      10, // TTL 10 секунд
    );
  }

  // Получение списка лидеров
  async getRoundLeaderboard(roundId: string): Promise<
    Array<{
      userId: string;
      username: string;
      taps: number;
      score: number;
    }>
  > {
    const cacheKey = `round_leaderboard:${roundId}`;

    return this.cacheService.getOrSet<
      Array<{
        userId: string;
        username: string;
        taps: number;
        score: number;
      }>
    >(
      cacheKey,
      async () => {
        const participations = await this.participationRepository
          .createQueryBuilder('participation')
          .leftJoinAndSelect('participation.user', 'user')
          .where('participation.roundId = :roundId', { roundId })
          .orderBy('participation.score', 'DESC')
          .addOrderBy('participation.taps', 'DESC')
          .getMany();

        return participations.map((p) => ({
          userId: p.userId,
          username: p.user.username,
          taps: p.taps,
          score: p.score,
        }));
      },
      10, // TTL 10 секунд
    );
  }

  // Получение победителя раунда
  async getRoundWinner(roundId: string): Promise<{
    userId: string;
    username: string;
    score: number;
  } | null> {
    const cacheKey = `round_winner:${roundId}`;

    return this.cacheService.getOrSet<{
      userId: string;
      username: string;
      score: number;
    } | null>(
      cacheKey,
      async () => {
        const winner = await this.participationRepository
          .createQueryBuilder('participation')
          .leftJoinAndSelect('participation.user', 'user')
          .where('participation.roundId = :roundId', { roundId })
          .andWhere('participation.score > 0')
          .orderBy('participation.score', 'DESC')
          .getOne();

        if (!winner) {
          return null;
        }

        return {
          userId: winner.userId,
          username: winner.user.username,
          score: winner.score,
        };
      },
      30, // TTL 30 секунд
    );
  }

  // Получение статистики раунда
  async getRoundStats(
    roundId: string,
  ): Promise<{ totalScore: number; totalTaps: number; isComplete: boolean }> {
    const cacheKey = `round_stats:${roundId}`;

    return this.cacheService.getOrSet<{
      totalScore: number;
      totalTaps: number;
      isComplete: boolean;
    }>(
      cacheKey,
      async () => {
        const round = await this.roundRepository.findOne({
          where: { id: roundId },
        });

        const stats = await this.participationRepository
          .createQueryBuilder('p')
          .select('SUM(p.taps)', 'totalTaps')
          .addSelect('SUM(p.score)', 'totalScore')
          .where('p.roundId = :roundId', { roundId })
          .getRawOne();

        return {
          totalScore: Number(stats?.totalScore || 0),
          totalTaps: Number(stats?.totalTaps || 0),
          isComplete: round?.calculationComplete || false,
        };
      },
      10, // TTL 10 секунд
    );
  }

  // Принудительный пересчет статистики раунда
  async forceRecalculateRoundStats(roundId: string): Promise<void> {
    const hasLock = await this.lockService.acquireLock(
      `force_recalc:${roundId}`,
      30000,
    );

    if (hasLock) {
      try {
        await this.calculateRoundStats(roundId);
      } finally {
        await this.lockService.releaseLock(`force_recalc:${roundId}`);
      }
    } else {
      throw new BadRequestException('Пересчет статистики уже выполняется');
    }
  }
}
