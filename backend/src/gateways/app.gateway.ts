import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PrometheusService } from '../common/metrics/prometheus.service';
import * as process from 'node:process';
import { TapService } from '@ThLOG/game/tap.service';
import { RoundsService } from '@ThLOG/round/round.service';
import { AuthService } from '@ThLOG/auth/services';

interface RoomUser {
  socketId: string;
  userId: string;
  username: string;
  joinedAt: Date;
}
@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.WS_CORS_ORIGIN,
  },
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients: number = 0;
  private roomUsers = new Map<string, Map<string, RoomUser>>(); // roundId -> Map<socketId, RoomUser>
  private socketToUser = new Map<
    string,
    { userId: string; username: string }
  >(); // socketId -> user info

  constructor(
    private prometheusService: PrometheusService,
    @Inject(forwardRef(() => TapService))
    private tapService: TapService,

    @Inject(forwardRef(() => RoundsService))
    private roundService: RoundsService,

    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  async handleConnection(client: Socket) {
    const token =
      client.handshake.auth.token || client.handshake.headers.authorization;
    try {
      if (!token) {
        client.disconnect();
        return;
      }
      const user = await this.authService.verifyToken(token);

      if (!user) {
        client.disconnect();
        return;
      }

      this.connectedClients++;
      this.updateActiveConnections();
      console.log(`Client connected: ${client.id}`);
    } catch (error) {
      console.error('WebSocket authentication failed:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedClients--;
    this.updateActiveConnections();

    // Получаем информацию о пользователе
    const userInfo = this.socketToUser.get(client.id);

    // Удаляем клиента из всех комнат
    this.roomUsers.forEach((users, roundId) => {
      if (users.has(client.id)) {
        users.delete(client.id);

        // Уведомляем оставшихся пользователей о выходе
        if (userInfo) {
          this.server.to(`round-${roundId}`).emit('user-left', {
            userId: userInfo.userId,
            username: userInfo.username,
            totalUsers: users.size,
          });
        }

        // Удаляем пустые комнаты
        if (users.size === 0) {
          this.roomUsers.delete(roundId);
        }
      }
    });

    // Удаляем из карты сокетов
    this.socketToUser.delete(client.id);

    console.log(`Client disconnected: ${client.id}`);
  }

  // Подключение к комнате раунда
  @SubscribeMessage('join-round')
  async handleJoinRound(
    @MessageBody() data: { roundId: string; userId: string; username: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roundId } = data;

    const { sub: userId, username } = await this.authService.verifyToken(
      client.handshake.auth.token,
    );

    // Сохраняем информацию о пользователе
    this.socketToUser.set(client.id, { userId, username });

    // Добавляем в комнату Socket.IO
    client.join(`round-${roundId}`);

    // Отслеживаем пользователей в комнате
    if (!this.roomUsers.has(roundId)) {
      this.roomUsers.set(roundId, new Map());
    }

    const roomUserMap = this.roomUsers.get(roundId)!;
    roomUserMap.set(client.id, {
      socketId: client.id,
      userId,
      username,
      joinedAt: new Date(),
    });
    await this.roundService.joinRound(roundId, userId);
    // Уведомляем всех в комнате о новом участнике
    this.server.to(`round-${roundId}`).emit('user-joined', {
      userId,
      username,
      totalUsers: roomUserMap.size,
    });

    // Отправляем актуальный список пользователей новому участнику
    const activeUsers = Array.from(roomUserMap.values()).map((user) => ({
      userId: user.userId,
      username: user.username,
      joinedAt: user.joinedAt,
    }));

    client.emit('room-users', { roundId, users: activeUsers });
  }

  // Покидание комнаты раунда
  @SubscribeMessage('leave-round')
  handleLeaveRound(
    @MessageBody() data: { roundId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roundId, userId } = data;
    const userInfo = this.socketToUser.get(client.id);

    client.leave(`round-${roundId}`);

    if (this.roomUsers.has(roundId)) {
      const roomUserMap = this.roomUsers.get(roundId)!;
      roomUserMap.delete(client.id);

      this.server.to(`round-${roundId}`).emit('user-left', {
        userId,
        username: userInfo?.username,
        totalUsers: roomUserMap.size,
      });

      // Удаляем пустые комнаты
      if (roomUserMap.size === 0) {
        this.roomUsers.delete(roundId);
      }
    }
  }

  // Запрос статистики раунда
  @SubscribeMessage('request-round-stats')
  handleRequestRoundStats(
    @MessageBody() data: { roundId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roundId } = data;
    // Здесь можно вызвать TapService для получения актуальной статистики
    // Но лучше это делать через инжекцию зависимостей в методе обновления
  }

  // Методы для отправки обновлений
  broadcastRoundUpdate(roundId: string, data: any) {
    this.server.to(`round-${roundId}`).emit('round-update', data);
  }

  broadcastTapUpdate(roundId: string, data: any) {
    this.server.to(`round-${roundId}`).emit('tap-update', data);
  }

  broadcastTimerUpdate(roundId: string, data: any) {
    this.server.to(`round-${roundId}`).emit('timer-update', data);
  }

  broadcastRoundStatusChange(roundId: string, status: string, data?: any) {
    this.server.to(`round-${roundId}`).emit('round-status-change', {
      status,
      timestamp: new Date(),
      ...data,
    });
  }

  // Отправка сообщений в комнату
  broadcastToRoom(roundId: string, event: string, data: any) {
    this.server.to(`round-${roundId}`).emit(event, data);
  }

  // Получение количества пользователей в комнате
  getRoomUserCount(roundId: string): number {
    const roomUserMap = this.roomUsers.get(roundId);
    return roomUserMap ? roomUserMap.size : 0;
  }

  // Получение списка пользователей в комнате
  getRoomUsers(roundId: string): RoomUser[] {
    const roomUserMap = this.roomUsers.get(roundId);
    return roomUserMap ? Array.from(roomUserMap.values()) : [];
  }

  private updateActiveConnections() {
    this.prometheusService.setActiveConnections(this.connectedClients);
  }

  afterInit(server: Server) {
    console.log('🚀 WebSocket Gateway инициализирован');
    console.log('📡 WebSocket сервер готов к подключениям');
    console.log('🔧 Адрес сервера:', server.engine.opts);
  }

  // Основной обработчик тапов через WebSocket
  @SubscribeMessage('tap')
  async handleTap(
    @MessageBody() data: { roundId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // Получаем пользователя из сохраненных данных
      const userInfo = this.socketToUser.get(client.id);
      if (!userInfo) {
        client.emit('tap-error', { message: 'Пользователь не авторизован' });
        return;
      }

      const { roundId } = data;
      const { userId, username } = userInfo;

      // Выполняем тап через сервис
      const tapResult = await this.tapService.processTap(userId, roundId);

      // Отправляем результат тапа самому пользователю
      client.emit('tap-result', {
        success: true,
        roundId,
        userId,
        username,
        tapResult: {
          score: tapResult.score,
          totalTaps: tapResult.taps,
          // roundTotalTaps: tapResult.roundTotalTaps,
          // roundTotalScore: tapResult.roundTotalScore
        },
        timestamp: new Date(),
      });

      // const leaderboard = await this.tapService.getRoundLeaderboard(roundId);

      this.server.to(`round-${roundId}`).emit('tap-performed', {
        roundId,
        userId,
        username,
        tapResult: {
          // userScore: tapResult.score,
          // userTaps: tapResult.totalTaps,
          // roundTotalTaps: tapResult.roundTotalTaps,
          // roundTotalScore: tapResult.roundTotalScore
        },
        // leaderboard,
        timestamp: new Date(),
      });

      console.log(
        `Tap processed: User ${username} (${userId}) in round ${roundId}`,
      );
    } catch (error) {
      console.error('Error processing tap:', error);
      client.emit('tap-error', {
        message: error.message,
        timestamp: new Date(),
      });
    }
  }
}
