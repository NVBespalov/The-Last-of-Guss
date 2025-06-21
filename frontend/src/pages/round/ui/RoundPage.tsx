import {useEffect} from 'react'
import {Link, Navigate, useParams} from 'react-router-dom'
import {Alert, Box, Button, CircularProgress} from '@mui/material'
import {ArrowBack as ArrowBackIcon} from '@mui/icons-material'
import {useAppDispatch, useAppSelector, useWebSocket} from '@/shared'
import {useInterval} from '@/shared'
import {clearCurrentRound, fetchRoundDetails} from '@/features'
import {RoundStatus} from '@/entities'
import {GooseGame} from '@/widgets'
import {ConnectionStatus} from "@/shared";

export function RoundPage() {
    const {id} = useParams<{ id: string }>()
    const dispatch = useAppDispatch()
    const {isAuthenticated, loading: authLoading} = useAppSelector((state) => state.auth)
    const {currentRound, loading, error} = useAppSelector((state) => state.game)
    const user = useAppSelector((state) => {
        return state.auth.user;
    })
    useEffect(() => {
        if (id && isAuthenticated) {
            dispatch(fetchRoundDetails(id))
        }

        return () => {
            dispatch(clearCurrentRound())
        }
    }, [dispatch, id, isAuthenticated]);

    const { isConnected, socket } = useWebSocket();

    useEffect(() => {
        if (!socket) return



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

        return () => {
            socket.off('tap-update')
            socket.off('round-update')
            socket.off('round-status-change')
            socket.off('timer-update')
            socket.off('tap-error')
        }
    }, [socket, user])



    const handleStatusChange = () => {
        if (id) {
            dispatch(fetchRoundDetails(id))
        }
    }

    if (authLoading) {
        return null
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace/>
    }

    if (!id) {
        return <Navigate to="/rounds" replace/>
    }

    if (loading && !currentRound) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}>
                <CircularProgress/>
            </Box>
        )
    }

    if (error && !currentRound) {
        return (
            <Box sx={{textAlign: 'center', mt: 4}}>
                <Alert severity="error" sx={{mb: 2}}>
                    {error}
                </Alert>
                <Button
                    component={Link}
                    to="/rounds"
                    variant="contained"
                    startIcon={<ArrowBackIcon/>}
                >
                    Вернуться к раундам
                </Button>
            </Box>
        )
    }

    if (!currentRound) {
        return (
            <Box sx={{textAlign: 'center', mt: 4}}>
                <Alert severity="warning" sx={{mb: 2}}>
                    Раунд не найден
                </Alert>
                <Button
                    component={Link}
                    to="/rounds"
                    variant="contained"
                    startIcon={<ArrowBackIcon/>}
                >
                    Вернуться к раундам
                </Button>
            </Box>
        )
    }

    return (
        <Box>
            <Box sx={{mb: 2}}>
                <Button
                    component={Link}
                    to="/rounds"
                    startIcon={<ArrowBackIcon/>}
                    variant="outlined"
                >
                    Раунды
                </Button>
            </Box>
            <ConnectionStatus/>
            <RoundStatus round={currentRound} onStatusChange={handleStatusChange}/>
            <GooseGame round={currentRound}/>
        </Box>
    )
}