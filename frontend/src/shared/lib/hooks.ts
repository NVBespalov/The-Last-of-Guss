import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux'
import type {AppDispatch, RootState} from '@app/providers/store'
import {useCallback, useContext, useEffect, useState} from "react";
import {WebSocketContext} from "@app/providers/websocket";
import {Round, RoundStatus} from "@entities/round/model/types.ts";
import {
    fetchRoundMyStatistics,
    fetchRoundStatistics,
    incrementLocalTapCount,
    tapGoose
} from "@features/game/model/slice.ts";

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector


export const useCountdown = (targetDate: string | Date, onComplete?: () => void) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const [isCompleteCalled, setIsCompleteCalled] = useState(false);

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
            if (newTimeLeft === 0 && onComplete && !isCompleteCalled) {
                setIsCompleteCalled(true);
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
    isClickable: boolean;
    roundError: string | null;
} {
    const {tapping, roundStats} = useAppSelector((state) => ({
        tapping: state.game.tapping,
        user: state.auth.user,
        roundStats: state.game.roundStats,
    }));
    const dispatch = useAppDispatch();

    const [roundError, setRoundError] = useState<string | null>(null);

    useEffect(() => {
        if (round?.status === RoundStatus.FINISHED && round.id && roundStats?.totalScore === 0) {
            dispatch(fetchRoundStatistics(round.id));
            dispatch(fetchRoundMyStatistics(round.id));
        }
    }, [round?.status, round?.id, dispatch, roundStats?.totalScore])

    useEffect(() => {
        setRoundError(null);
    }, [round?.status]);


    const tap = useCallback(() => {
        if (!round?.id) {
            setRoundError('Раунд не найден');
            return;
        }

        if (round.status === RoundStatus.COOLDOWN) {
            setRoundError('Раунд еще не начался');
            return;
        }

        if (round.status === RoundStatus.FINISHED) {
            setRoundError('Раунд уже завершен');
            return;
        }

        if (tapping) {
            return;
        }

        dispatch(tapGoose(round.id));
        dispatch(incrementLocalTapCount());
    }, [round.status, tapping, round.id, dispatch]);

    const isClickable = round.status === 'active' && !tapping;

    return {
        tap,
        isClickable,
        roundError,
    };
}

