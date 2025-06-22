import {useDispatch, useSelector, TypedUseSelectorHook} from 'react-redux'
import type {RootState, AppDispatch} from '@app/providers/store'
import {useCallback, useContext, useEffect, useState} from "react";
import {WebSocketContext} from "@app/providers/websocket";
import {Round, RoundStatus, RoundUpdate} from "@entities/round/model/types.ts";
import {updateRoundFromSocket, updateTimeFromSocket} from "@features/game/model/slice.ts";

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector


export const useCountdown = (targetDate: string | Date, onComplete?: () => void) => {
    const [timeLeft, setTimeLeft] = useState(0)

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date().getTime()
            const target = new Date(targetDate).getTime()
            const difference = target - now
            return Math.max(0, Math.floor(difference / 1000))
        }

        setTimeLeft(calculateTimeLeft())

        const timer = setInterval(() => {
            const newTimeLeft = calculateTimeLeft()
            setTimeLeft(newTimeLeft)

            if (newTimeLeft === 0 && onComplete) {
                onComplete()
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [targetDate, onComplete])

    return timeLeft
}

export const useInterval = (callback: () => void, delay: number | null) => {
    useEffect(() => {
        if (delay === null) return

        const timer = setInterval(callback, delay)
        return () => clearInterval(timer)
    }, [callback, delay])
}

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);

    if (!context) {
        throw new Error('useWebSocket must be used within WebSocketProvider');
    }

    return context;
};

export function useRoundManager(round: Round): {
    tap: () => void;
    startRound: () => void;
    finishRound: () => void;
    resetRound: () => void;
    joinRound: () => void;
    leaveRound: () => void;
    isClickable: boolean;
    roundError: string | null;
} {
    const {tapping, user} = useAppSelector((state) => ({
        tapping: state.game.tapping,
        user: state.auth.user,
    }));

    const [roundError, setRoundError] = useState<string | null>(null);
    const {socket} = useWebSocket();
    const dispatch = useAppDispatch();
    useEffect(() => {
        if (socket && round.status === 'active') {
            socket.emit('join-round', {roundId: round.id});

            socket.on('join-round-response', (data: { success: boolean, message?: string }) => {
                if (!data.success) {
                    // handle error
                }
            });

            return () => {
                socket.off('join-round-response');
            };
        }
    }, [socket, round.id, round.status]);

    useEffect(() => {
        if (!socket) return;

        socket.on('round-update', (data: RoundUpdate) => {
            const {
                taps: myTaps,
                score: myScore
            } = data.leaderboard?.find(({userId}) => user?.id === userId) ?? {taps: 0, score: 0};
            dispatch(updateRoundFromSocket({...data, myTaps, myScore}))
        });

        socket.on('timer-update', (data: { timeRemaining: number, timeLeft: number }) => {

            dispatch(updateTimeFromSocket({timeLeft: data.timeLeft, timeRemaining: data.timeRemaining}));
        });

        socket.on('round-status-change', (data: {
            status: RoundStatus,
            winner?: { username: string, score: number },
        }) => {
            dispatch(updateRoundFromSocket({status: data.status}))
            setRoundError(null);
        });

        socket.on('tap-error', (data: { message: string }) => {
            setRoundError(data.message);
        });

        return () => {
            socket.off('round-update');
            socket.off('timer-update');
            socket.off('round-status-change');
            socket.off('tap-error');
        };
    }, [socket, user]);

    const tap = useCallback(() => {
        if (round.status === 'active' && !tapping && socket) {
            socket.emit('tap', {roundId: round.id, userId: user?.id || ''});
        }
    }, [round.status, tapping, socket, round.id]);

    const startRound = useCallback(() => {
        socket?.emit('round-start', {roundId: round.id});
    }, [socket, round.id]);

    const finishRound = useCallback(() => {
        socket?.emit('round-finish', {roundId: round.id});
    }, [socket, round.id]);

    const resetRound = useCallback(() => {
        socket?.emit('round-reset', {roundId: round.id});
    }, [socket, round.id]);

    const joinRound = useCallback(() => {
        socket?.emit('join-round', {roundId: round.id, userId: user});
    }, [socket, round.id]);

    const leaveRound = useCallback(() => {
        socket?.emit('leave-round', {roundId: round.id});
    }, [socket, round.id]);

    const isClickable = round.status === 'active' && !tapping;

    return {
        tap,
        startRound,
        finishRound,
        resetRound,
        joinRound,
        leaveRound,
        isClickable,
        roundError,
    };
}

