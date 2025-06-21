import { Box, Typography, Alert, Divider } from '@mui/material'
import { useAppDispatch, useAppSelector, useWebSocket } from '@/shared'
import { tapGoose } from '@/features'
import { Round } from '@/entities'
import { useEffect, useState } from 'react'

interface GooseGameProps {
    round: Round
}

interface TapUpdate {
    userId: string
    username: string
    userScore: number
    totalTaps: number
    roundScore: number
}

interface RoundUpdate {
    status: 'waiting' | 'active' | 'finished'
    startTime?: Date
    endTime?: Date
    timeRemaining?: number
    winner?: {
        username: string
        score: number
    }
    totalTaps?: number
}

const GooseArt = `            ░░░░░░░░░░░░░░░
          ░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░
        ░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░
        ░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░
      ░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░
    ░░▒▒▒▒░░░░▓▓▓▓▓▓▓▓▓▓▓▓░░░░▒▒▒▒░░
    ░░▒▒▒▒▒▒▒▒░░░░░░░░░░░░▒▒▒▒▒▒▒▒░░
    ░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░
      ░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░
        ░░░░░░░░░░░░░░░░░░░░░░░░░░`

export function GooseGame({ round }: GooseGameProps) {
    const dispatch = useAppDispatch()
    const { tapping, error, user } = useAppSelector((state) => {
        return {...state.game, user: state.auth.user};
    })

    // Преобразуем статус раунда в нужный тип
    const normalizeStatus = (status: string): 'waiting' | 'active' | 'finished' => {
        if (status === 'cooldown') return 'waiting'
        if (status === 'active') return 'active'
        if (status === 'finished') return 'finished'
        return 'waiting'
    }

    const [roundState, setRoundState] = useState<RoundUpdate>({
        status: normalizeStatus(round.status),
        timeRemaining: 0,
        totalTaps: round.totalTaps || 0
    })
    const [myScore, setMyScore] = useState(round.myScore || 0)
    const [timeRemaining, setTimeRemaining] = useState(0)
    const { connectionError, socket } = useWebSocket();

    useEffect(() => {
        if (socket && round.status === 'active') {
            socket.emit('join-round', {roundId: round.id});

            socket.on('join-round-response', (data: { success: boolean, message?: string }) => {
                if (!data.success) {
                    console.error('Failed to join round:', data.message);
                }
            });

            return () => {
                socket.off('join-round-response');
            };
        }
    }, [socket, round.id, round.status]);


    //
    // // Обработка событий сокета
    useEffect(() => {
        if (!socket) return

        // Обновление после тапа
        socket.on('tap-update', (data: TapUpdate) => {
            if (data.userId === user?.id) {
                setMyScore(data.userScore)
            }
            setRoundState(prev => ({
                ...prev,
                totalTaps: data.totalTaps
            }))
        })

        // Обновление состояния раунда
        socket.on('round-update', (data: RoundUpdate) => {
            setRoundState(prev => ({ ...prev, ...data }))
        })

        // Изменение статуса раунда
        socket.on('round-status-change', (data: { status: string, winner?: any, totalTaps?: number }) => {
            setRoundState(prev => ({
                ...prev,
                status: normalizeStatus(data.status),
                winner: data.winner,
                totalTaps: data.totalTaps || prev.totalTaps
            }))
        })

        // Обновление таймера
        socket.on('timer-update', (data: { timeRemaining: number }) => {
            setTimeRemaining(data.timeRemaining)
        })

        // Ошибка тапа
        socket.on('tap-error', (data: { message: string }) => {
            console.error('Tap error:', data.message)
        })

        return () => {
            socket.off('tap-update')
            socket.off('round-update')
            socket.off('round-status-change')
            socket.off('timer-update')
            socket.off('tap-error')
        }
    }, [socket, user])
    //

    const handleTap = () => {
        if (roundState.status === 'active' && !tapping && socket) {
            // dispatch(tapGoose(round.id))
            socket.emit('tap', { roundId: round.id })
        }
    }

    const isClickable = roundState.status === 'active' && !tapping

    return (
        <Box sx={{ textAlign: 'center', maxWidth: 400, mx: 'auto', p: 2 }}>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            <Box
                onClick={(handleTap as any) as () => void}
                sx={{
                    cursor: isClickable ? 'pointer' : 'default',
                    userSelect: 'none',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    lineHeight: 1.2,
                    whiteSpace: 'pre',
                    display: 'inline-block',
                    padding: 3,
                    border: isClickable ? '2px solid transparent' : 'none',
                    borderRadius: 2,
                    transition: 'all 0.2s',
                    backgroundColor: 'background.paper',
                    '&:hover': isClickable ? {
                        borderColor: 'primary.main',
                        backgroundColor: 'action.hover',
                        transform: 'scale(1.05)',
                        boxShadow: 3,
                    } : {},
                    '&:active': isClickable ? {
                        transform: 'scale(0.95)',
                    } : {},
                    opacity: tapping ? 0.7 : 1,
                }}
            >
                {GooseArt}
            </Box>
        </Box>
    )
}