// src/entities/round/api/websocket.ts
import { websocketService } from '@/shared/api/websocket';
import { RoundEventData } from '@/shared/api/websocket';

export const roundWebSocketApi = {
    // Подписка на события раундов
    subscribeToRoundEvents(callbacks: {
        onRoundCreated?: (data: RoundEventData) => void;
        onRoundStarted?: (data: RoundEventData) => void;
        onRoundEnded?: (data: RoundEventData) => void;
        onRoundUpdated?: (data: RoundEventData) => void;
    }) {
        const { onRoundCreated, onRoundStarted, onRoundEnded, onRoundUpdated } = callbacks;

        if (onRoundCreated) {
            websocketService.on('round:created', onRoundCreated);
        }
        if (onRoundStarted) {
            websocketService.on('round:started', onRoundStarted);
        }
        if (onRoundEnded) {
            websocketService.on('round:ended', onRoundEnded);
        }
        if (onRoundUpdated) {
            websocketService.on('round:updated', onRoundUpdated);
        }

        // Возвращаем функцию отписки
        return () => {
            if (onRoundCreated) {
                websocketService.off('round:created', onRoundCreated);
            }
            if (onRoundStarted) {
                websocketService.off('round:started', onRoundStarted);
            }
            if (onRoundEnded) {
                websocketService.off('round:ended', onRoundEnded);
            }
            if (onRoundUpdated) {
                websocketService.off('round:updated', onRoundUpdated);
            }
        };
    },

    // Операции с раундами через WebSocket
    joinRound(roundId: string) {
        websocketService.emit('round:join', { roundId });
    },

    leaveRound(roundId: string) {
        websocketService.emit('round:leave', { roundId });
    },

    subscribeToRound(roundId: string) {
        websocketService.emit('round:subscribe', { roundId });
    },

    unsubscribeFromRound(roundId: string) {
        websocketService.emit('round:unsubscribe', { roundId });
    },
};