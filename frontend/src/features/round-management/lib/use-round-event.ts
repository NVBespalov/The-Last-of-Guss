// src/features/round-management/lib/use-round-events.ts
import { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/app/providers/store';
import { roundWebSocketApi } from '@/entities/round/api/websocket';
import { RoundEventData } from '@/shared/api/websocket';
import {useWebSocket} from "@/shared";

// Здесь будут ваши Redux actions
// import { roundsActions } from '@/entities/round/model';

export const useRoundEvents = () => {
    const { isConnected } = useWebSocket();
    const dispatch = useDispatch<AppDispatch>();

    const handleRoundCreated = useCallback((data: RoundEventData) => {
        console.log('Новый раунд создан:', data);
        // dispatch(roundsActions.addRound(data));

        // Показываем уведомление
        // dispatch(notificationsActions.show({
        //   type: 'success',
        //   message: `Создан новый раунд: ${data.name}`
        // }));
    }, [dispatch]);

    const handleRoundStarted = useCallback((data: RoundEventData) => {
        console.log('Раунд начался:', data);
        // dispatch(roundsActions.updateRoundStatus({
        //   id: data.id,
        //   status: 'started'
        // }));
    }, [dispatch]);

    const handleRoundEnded = useCallback((data: RoundEventData) => {
        console.log('Раунд завершился:', data);
        // dispatch(roundsActions.updateRoundStatus({
        //   id: data.id,
        //   status: 'ended'
        // }));
    }, [dispatch]);

    const handleRoundUpdated = useCallback((data: RoundEventData) => {
        console.log('Раунд обновлен:', data);
        // dispatch(roundsActions.updateRound(data));
    }, [dispatch]);

    useEffect(() => {
        if (!isConnected) return;

        const unsubscribe = roundWebSocketApi.subscribeToRoundEvents({
            onRoundCreated: handleRoundCreated,
            onRoundStarted: handleRoundStarted,
            onRoundEnded: handleRoundEnded,
            onRoundUpdated: handleRoundUpdated,
        });

        return unsubscribe;
    }, [isConnected, handleRoundCreated, handleRoundStarted, handleRoundEnded, handleRoundUpdated]);

    const joinRound = useCallback((roundId: string) => {
        if (isConnected) {
            roundWebSocketApi.joinRound(roundId);
        }
    }, [isConnected]);

    const leaveRound = useCallback((roundId: string) => {
        if (isConnected) {
            roundWebSocketApi.leaveRound(roundId);
        }
    }, [isConnected]);

    const subscribeToRound = useCallback((roundId: string) => {
        if (isConnected) {
            roundWebSocketApi.subscribeToRound(roundId);
        }
    }, [isConnected]);

    const unsubscribeFromRound = useCallback((roundId: string) => {
        if (isConnected) {
            roundWebSocketApi.unsubscribeFromRound(roundId);
        }
    }, [isConnected]);

    return {
        joinRound,
        leaveRound,
        subscribeToRound,
        unsubscribeFromRound,
        isConnected,
    };
};