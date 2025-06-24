import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Round, RoundStatus } from '@ThLOG/round/entities/round.entity';
import { AppGateway } from '@ThLOG/gateways';
import { TapService } from '@ThLOG/game/tap.service';

@Injectable()
export class RoundTimerService implements OnModuleInit, OnModuleDestroy {
  private timers = new Map<string, NodeJS.Timeout>();
  private statusTimers = new Map<string, NodeJS.Timeout>();

  constructor(
    @InjectRepository(Round)
    private readonly roundRepository: Repository<Round>,
    private readonly appGateway: AppGateway,
    private readonly tapService: TapService,
  ) {}

  async onModuleInit() {
    await this.initializeExistingRoundTimers();

    this.startPeriodicTimerUpdates();
  }

  onModuleDestroy() {
    // Очищаем все таймеры при завершении модуля
    this.timers.forEach((timer) => clearTimeout(timer));
    this.statusTimers.forEach((timer) => clearInterval(timer));
    this.timers.clear();
    this.statusTimers.clear();
  }

  // Инициализация таймеров для существующих раундов
  private async initializeExistingRoundTimers() {
    const now = new Date();

    // Получаем все активные и запланированные раунды
    const rounds = await this.roundRepository
      .createQueryBuilder('round')
      .where('round.endTime > :now', { now })
      .getMany();

    for (const round of rounds) {
      this.setupRoundTimers(round);
    }
  }

  // Настройка таймеров для раунда
  setupRoundTimers(round: Round) {
    const now = new Date();
    const startTime = round.startTime.getTime();
    const endTime = round.endTime.getTime();
    const currentTime = now.getTime();

    // Очищаем существующие таймеры для этого раунда
    this.clearRoundTimers(round.id);

    // Таймер для начала раунда
    if (currentTime < startTime) {
      const startDelay = startTime - currentTime;
      const startTimer = setTimeout(() => {
        void this.handleRoundStart(round.id);
      }, startDelay);

      this.timers.set(`start-${round.id}`, startTimer);
    }

    // Таймер для завершения раунда
    if (currentTime < endTime) {
      const endDelay = endTime - currentTime;
      const endTimer = setTimeout(() => {
        void this.handleRoundEnd(round.id);
      }, endDelay);

      this.timers.set(`end-${round.id}`, endTimer);
    }

    // Периодическое обновление таймера (каждую секунду)
    const updateTimer = setInterval(() => {
      void this.sendTimerUpdate(round.id);
    }, 1000);

    this.statusTimers.set(round.id, updateTimer);
  }

  // Очистка таймеров для раунда
  private clearRoundTimers(roundId: string) {
    const startTimer = this.timers.get(`start-${roundId}`);
    const endTimer = this.timers.get(`end-${roundId}`);
    const statusTimer = this.statusTimers.get(roundId);

    if (startTimer) {
      clearTimeout(startTimer);
      this.timers.delete(`start-${roundId}`);
    }

    if (endTimer) {
      clearTimeout(endTimer);
      this.timers.delete(`end-${roundId}`);
    }

    if (statusTimer) {
      clearInterval(statusTimer);
      this.statusTimers.delete(roundId);
    }
  }

  // Обработка начала раунда
  private async handleRoundStart(roundId: string) {
    console.log(`Round ${roundId} started`);

    this.appGateway.broadcastRoundStatusChange(roundId, 'active', {
      message: 'Раунд начался! Можно тапать по гусю!',
    });

    // Отправляем обновление статистики
    try {
      await this.tapService.forceRecalculateRoundStats(roundId);
    } catch (error) {
      console.error('Error updating round stats on start:', error);
    }
  }

  // Обработка завершения раунда
  private async handleRoundEnd(roundId: string) {
    console.log(`Round ${roundId} ended`);

    try {
      // Получаем победителя
      const winner = await this.tapService.getRoundWinner(roundId);

      this.appGateway.broadcastRoundStatusChange(roundId, 'finished', {
        message: 'Раунд завершен!',
        winner: winner,
      });

      // Отправляем финальную статистику
      await this.tapService.forceRecalculateRoundStats(roundId);
    } catch (error) {
      console.error('Error handling round end:', error);
    }

    // Очищаем таймеры для этого раунда
    this.clearRoundTimers(roundId);
  }

  // Отправка обновления таймера
  private async sendTimerUpdate(roundId: string) {
    try {
      const round = await this.roundRepository.findOne({
        where: { id: roundId },
      });
      if (!round) return;

      const now = new Date();
      const currentTime = now.getTime();
      const startTime = round.startTime.getTime();
      const endTime = round.endTime.getTime();

      let timeLeft = 0;
      let timeRemaining = 0;
      let status: RoundStatus;

      if (currentTime < startTime) {
        // Cooldown период
        timeRemaining = Math.floor((startTime - currentTime) / 1000);
        status = RoundStatus.COOLDOWN;
      } else if (currentTime < endTime) {
        // Активный раунд
        timeLeft = Math.floor((endTime - currentTime) / 1000);
        status = RoundStatus.ACTIVE;
      } else {
        // Раунд завершен
        timeLeft = 0;
        status = RoundStatus.FINISHED;
        this.clearRoundTimers(roundId);
      }

      this.appGateway.broadcastTimerUpdate(roundId, {
        status,
        timeLeft,
        timeRemaining,
        startTime: round.startTime,
        endTime: round.endTime,
        timestamp: now,
      });
    } catch (error) {
      console.error(`Error updating timer for round ${roundId}:`, error);
    }
  }

  // Периодическое обновление всех таймеров
  private startPeriodicTimerUpdates() {
    setInterval(async () => {
      // Каждые 30 секунд проверяем, нет ли новых раундов
      await this.checkForNewRounds();
    }, 30000);
  }

  // Проверка новых раундов
  private async checkForNewRounds() {
    const now = new Date();

    const newRounds = await this.roundRepository
      .createQueryBuilder('round')
      .where('round.endTime > :now', { now })
      .getMany();

    for (const round of newRounds) {
      if (!this.statusTimers.has(round.id)) {
        this.setupRoundTimers(round);
      }
    }
  }

  // Публичный метод для настройки таймеров при создании нового раунда
  async setupTimersForNewRound(roundId: string) {
    const round = await this.roundRepository.findOne({
      where: { id: roundId },
    });
    if (round) {
      this.setupRoundTimers(round);
    }
  }
}
