import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'
import type { RootState, AppDispatch } from '@app/providers/store'
import {useContext, useEffect, useState} from "react";
import {WebSocketContext} from "@app/providers/websocket";

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

