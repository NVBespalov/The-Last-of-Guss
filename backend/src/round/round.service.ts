import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Round, RoundStatus } from './entities/round.entity';

import { CreateRoundDto } from './dto/create-round.dto';
import {
  RoundListResponseDto,
  RoundResponseDto,
} from './dto/round-response.dto';
import { RoundParticipation } from '@ThLOG/round/entities/round-participations.entity';
import { User, UserRole } from '@ThLOG/auth/entities';
import { TapService } from '@ThLOG/game/tap.service';
import { RoundTimerService } from '@ThLOG/common/timer/round-timer.service';

@Injectable()
export class RoundsService {
  constructor(
    @InjectRepository(Round)
    private readonly roundRepository: Repository<Round>,
    @InjectRepository(RoundParticipation)
    private readonly participationRepository: Repository<RoundParticipation>,
    private readonly configService: ConfigService,
    private readonly tapService: TapService,
    private readonly roundTimerService: RoundTimerService,
  ) {}

  async createRound(createRoundDto: CreateRoundDto): Promise<RoundResponseDto> {
    const defaultDuration = this.configService.get<number>('roundDuration', 60);
    const defaultCooldown = this.configService.get<number>('cooldownTime', 30);

    const now = new Date();
    const duration = createRoundDto.duration || defaultDuration;
    const cooldown = createRoundDto.cooldown || defaultCooldown;

    // Проверяем, что нет активных или запланированных раундов
    const activeRound = await this.roundRepository
      .createQueryBuilder('round')
      .where('(round.endTime > :now) OR (round.startTime > :cooldownStart)', {
        now,
        cooldownStart: new Date(now.getTime() - cooldown * 1000),
      })
      .getOne();

    if (activeRound) {
      throw new BadRequestException(
        'Уже существует активный или запланированный раунд',
      );
    }

    const startTime = createRoundDto.startTime
      ? new Date(createRoundDto.startTime)
      : new Date(now.getTime() + cooldown * 60 * 1000);

    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

    if (startTime <= now) {
      throw new BadRequestException(
        'Время начала раунда должно быть в будущем',
      );
    }

    let status: RoundStatus;

    if (now < startTime) {
      status = RoundStatus.COOLDOWN;
    } else if (now < endTime) {
      status = RoundStatus.ACTIVE;
    } else {
      status = RoundStatus.FINISHED;
    }

    // Создаем раунд
    const round = this.roundRepository.create({
      startTime,
      endTime,
      status,
    });

    const savedRound = await this.roundRepository.save(round);
    await this.roundTimerService.setupTimersForNewRound(savedRound.id);

    return this.mapToRoundResponse(savedRound);
  }

  async getRounds(): Promise<RoundListResponseDto[]> {
    const rounds = await this.roundRepository.find({
      order: { createdAt: 'DESC' },
    });

    return rounds.map((round) => ({
      id: round.id,
      startTime: round.startTime,
      endTime: round.endTime,
      status: this.calculateCurrentStatus(round),
    }));
  }

  async getRoundById(id: string, user?: User): Promise<RoundResponseDto> {
    const round = await this.roundRepository.findOne({
      where: { id },
      relations: ['participations', 'participations.user'],
    });

    if (!round) {
      throw new BadRequestException('Раунд не найден');
    }

    const response = this.mapToRoundResponse(round);

    // Добавляем информацию о пользователе, если он авторизован
    if (user) {
      const participation = round.participations?.find(
        (p) => p.userId === user.id,
      );
      if (participation) {
        response.myScore = participation.score;
        response.myTaps = participation.taps;
      }
    }

    // Добавляем информацию о победителе, если раунд завершен
    if (
      response.status === RoundStatus.FINISHED &&
      round.participations?.length > 0
    ) {
      const winner = round.participations
        .filter((p) => p.user.role !== UserRole.NIKITA) // Исключаем Никиту
        .sort((a, b) => b.score - a.score)[0];

      if (winner) {
        response.winner = {
          username: winner.user.username,
          score: winner.score,
        };
      }
    }

    return response;
  }

  private mapToRoundResponse(round: Round): RoundResponseDto {
    return {
      id: round.id,
      createdAt: round.createdAt,
      startTime: round.startTime,
      endTime: round.endTime,
      status: this.calculateCurrentStatus(round),
    };
  }

  private calculateCurrentStatus(round: Round): RoundStatus {
    const now = new Date();

    if (now < round.startTime) {
      return RoundStatus.COOLDOWN;
    } else if (now < round.endTime) {
      return RoundStatus.ACTIVE;
    } else {
      return RoundStatus.FINISHED;
    }
  }

  async findAll(): Promise<Round[]> {
    return await this.roundRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Round> {
    const round = await this.roundRepository.findOne({ where: { id } });
    if (!round) {
      throw new NotFoundException('Раунд не найден');
    }
    return round;
  }

  async getRoundDetails(
    roundId: string,
    userId?: string,
  ): Promise<{
    round: Round;
    myStats?: { taps: number; score: number };
    winner?: { userId: string; username: string; score: number };
    leaderboard?: Array<{
      userId: string;
      username: string;
      taps: number;
      score: number;
    }>;
  }> {
    const round = await this.findOne(roundId);
    const result: any = { round };

    // Если пользователь авторизован, получаем его статистику
    if (userId) {
      result.myStats = await this.tapService.getUserStats(userId, roundId);
    }

    // Если раунд завершен, получаем победителя и таблицу лидеров
    if (round.status === RoundStatus.FINISHED) {
      result.winner = await this.tapService.getRoundWinner(roundId);
      result.leaderboard = await this.tapService.getRoundLeaderboard(roundId);
    } else {
      // Для активных раундов показываем текущую таблицу лидеров
      result.leaderboard = await this.tapService.getRoundLeaderboard(roundId);
    }

    return result;
  }

  async getActiveRounds(): Promise<Round[]> {
    const now = new Date();
    return await this.roundRepository
      .createQueryBuilder('round')
      .where('round.startTime <= :now', { now })
      .andWhere('round.endTime > :now', { now })
      .getMany();
  }

  async getUpcomingRounds(): Promise<Round[]> {
    const now = new Date();
    return await this.roundRepository
      .createQueryBuilder('round')
      .where('round.startTime > :now', { now })
      .getMany();
  }

  async joinRound(
    roundId: string,
    userId: string,
  ): Promise<RoundParticipation> {
    // Проверяем, не участвует ли уже пользователь в раунде
    const existingParticipation = await this.participationRepository.findOne({
      where: { roundId: roundId, userId: userId },
    });

    if (existingParticipation) {
      return existingParticipation;
    }

    const participation = this.participationRepository.create({
      roundId: roundId,
      userId: userId,
      taps: 0,
      score: 0,
    });

    return await this.participationRepository.save(participation);
  }

  async getRoundParticipations(roundId: string): Promise<RoundParticipation[]> {
    return await this.participationRepository.find({
      where: { roundId },
      relations: ['user'],
      order: { score: 'DESC' },
    });
  }
  async getUserParticipation(
    roundId: string,
    userId: string,
  ): Promise<RoundParticipation | null> {
    return await this.participationRepository.findOne({
      where: { roundId: roundId, userId },
      relations: ['user', 'round'],
    });
  }
}
