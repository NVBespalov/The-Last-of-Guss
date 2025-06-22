import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Round } from '@ThLOG/round/entities/round.entity';
import { RoundParticipation } from '@ThLOG/round/entities/round-participations.entity';
import { User, UserRole } from '@ThLOG/auth/entities';
import { AppGateway } from '@ThLOG/gateways';
import { LockService } from '@ThLOG/common/services/lock.service';

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
  activeUsers: number;
  leaderboard: Array<{
    userId: string;
    username: string;
    taps: number;
    score: number;
  }>;
}
@Injectable()
export class TapService {
  constructor(
    @InjectRepository(Round)
    private readonly roundRepository: Repository<Round>,
    @InjectRepository(RoundParticipation)
    private readonly participationRepository: Repository<RoundParticipation>,
    private readonly dataSource: DataSource,
    private readonly appGateway: AppGateway,
    private readonly lockService: LockService,
  ) {}

  async processTap(userId: string, roundId: string): Promise<TapResult> {
    const lockKey = `tap:${userId}:${roundId}`;

    // Пытаемся получить блокировку
    const lockAcquired = await this.lockService.acquireLock(lockKey, 3000);
    if (!lockAcquired) {
      throw new ConflictException('Слишком много тапов, подождите секунду');
    }

    try {
      const result = await this.dataSource.transaction(async (manager) => {
        // 1. Проверяем пользователя
        const user = await manager.findOne(User, { where: { id: userId } });
        if (!user) {
          throw new BadRequestException('Пользователь не найден');
        }

        // 2. Проверяем раунд и его состояние
        const round = await manager.findOne(Round, { where: { id: roundId } });
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

        // 3. Получаем или создаем участие в раунде
        let participation = await manager.findOne(RoundParticipation, {
          where: { userId, roundId },
        });

        if (!participation) {
          participation = manager.create(RoundParticipation, {
            userId,
            roundId,
            taps: 0,
            score: 0,
          });
        }

        // 4. Увеличиваем счетчик тапов
        participation.taps += 1;

        // 5. Рассчитываем очки с учетом правил
        let pointsToAdd = 1; // базовое очко за тап

        // Каждый 11-й тап дает 10 очков
        if (participation.taps % 11 === 0) {
          pointsToAdd = 10;
        }

        // 6. Проверяем роль пользователя (Никита)
        const isNikita = user.role === UserRole.NIKITA;
        let actualScore = participation.score;

        if (!isNikita) {
          actualScore += pointsToAdd;
          participation.score = actualScore;
        }
        // Для Никиты тапы считаются, но очки не начисляются

        // 7. Сохраняем участие
        await manager.save(RoundParticipation, participation);

        // 8. Обновляем общий счетчик тапов в раунде
        await manager.increment(Round, { id: roundId }, 'totalTaps', 1);

        // 9. Обновляем общий счетчик очков в раунде (только для не-Никиты)
        if (!isNikita) {
          await manager.increment(
            Round,
            { id: roundId },
            'totalScore',
            pointsToAdd,
          );
        }

        return {
          userId,
          roundId,
          taps: participation.taps,
          score: actualScore,
          pointsEarned: isNikita ? 0 : pointsToAdd,
          message: isNikita
            ? 'Тап засчитан, но очки не начислены (роль Никита)'
            : undefined,
          username: user.username,
        };
      });

      // Отправляем обновления через WebSocket после успешной транзакции
      this.broadcastTapUpdate(result);
      await this.broadcastRoundStatsUpdate(roundId);

      return {
        userId: result.userId,
        roundId: result.roundId,
        taps: result.taps,
        score: result.score,
        pointsEarned: result.pointsEarned,
        message: result.message,
      };
    } finally {
      this.lockService.releaseLock(lockKey);
    }
  }

  async getUserStats(
    userId: string,
    roundId: string,
  ): Promise<{ taps: number; score: number }> {
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
  }

  async getRoundLeaderboard(roundId: string): Promise<
    Array<{
      userId: string;
      username: string;
      taps: number;
      score: number;
    }>
  > {
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
  }

  async getRoundWinner(roundId: string): Promise<{
    userId: string;
    username: string;
    score: number;
  } | null> {
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
  }

  async getRoundStats(
    roundId: string,
  ): Promise<{ totalScore: number; totalTaps: number }> {
    const round = await this.roundRepository.findOne({
      where: { id: roundId },
    });
    if (!round) {
      return { totalScore: 0, totalTaps: 0 };
    }

    return {
      totalScore: round.totalScore,
      totalTaps: round.totalTaps,
    };
  }

  // Методы для отправки WebSocket обновлений
  private broadcastTapUpdate(tapResult: any) {
    const tapUpdate = {
      userId: tapResult.userId,
      username: tapResult.username,
      taps: tapResult.taps,
      score: tapResult.score,
      pointsEarned: tapResult.pointsEarned,
      timestamp: new Date(),
    };

    this.appGateway.broadcastTapUpdate(tapResult.roundId, tapUpdate);
  }

  private async broadcastRoundStatsUpdate(roundId: string): Promise<void> {
    const [stats, leaderboard, activeUsers] = await Promise.all([
      this.getRoundStats(roundId),
      this.getRoundLeaderboard(roundId),
      this.appGateway.getRoomUserCount(roundId),
    ]);

    const statsUpdate: RoundStatsUpdate = {
      roundId,
      totalScore: stats.totalScore,
      totalTaps: stats.totalTaps,
      activeUsers,
      leaderboard: leaderboard.slice(0, 10), // топ-10
    };

    this.appGateway.broadcastRoundUpdate(roundId, statsUpdate);
  }

  // Метод для принудительного обновления статистики раунда
  async forceRoundStatsUpdate(roundId: string): Promise<void> {
    await this.broadcastRoundStatsUpdate(roundId);
  }
}
