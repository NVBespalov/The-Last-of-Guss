import  { useEffect } from 'react'
import { useParams, Navigate, Link } from 'react-router-dom'
import { Box, CircularProgress, Alert, Button } from '@mui/material'
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material'
import { useAppDispatch, useAppSelector } from '../../../shared/lib'
import { useInterval } from '../../../shared/lib/hooks'
import { fetchRoundDetails, clearCurrentRound } from '../../../features/game'
import { RoundStatus } from '../../../entities/round'
import { GooseGame } from '../../../widgets/goose-game'

export function RoundPage() {
    const { id } = useParams<{ id: string }>()
    const dispatch = useAppDispatch()
    const { isAuthenticated, loading: authLoading } = useAppSelector((state) => state.auth)
    const { currentRound, loading, error } = useAppSelector((state) => state.game)

    useEffect(() => {
        if (id && isAuthenticated) {
            dispatch(fetchRoundDetails(id))
        }

        return () => {
            dispatch(clearCurrentRound())
        }
    }, [dispatch, id, isAuthenticated])

    // Периодическое обновление статуса раунда
    useInterval(() => {
        if (id && currentRound && (currentRound.status === 'active' || currentRound.status === 'cooldown')) {
            dispatch(fetchRoundDetails(id))
        }
    }, 5000) // обновляем каждые 5 секунд

    const handleStatusChange = () => {
        if (id) {
            dispatch(fetchRoundDetails(id))
        }
    }

    if (authLoading) {
        return null
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    if (!id) {
        return <Navigate to="/rounds" replace />
    }

    if (loading && !currentRound) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        )
    }

    if (error && !currentRound) {
        return (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                <Button
                    component={Link}
                    to="/rounds"
                    variant="contained"
                    startIcon={<ArrowBackIcon />}
                >
                    Вернуться к раундам
                </Button>
            </Box>
        )
    }

    if (!currentRound) {
        return (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Раунд не найден
                </Alert>
                <Button
                    component={Link}
                    to="/rounds"
                    variant="contained"
                    startIcon={<ArrowBackIcon />}
                >
                    Вернуться к раундам
                </Button>
            </Box>
        )
    }

    return (
        <Box>
            <Box sx={{ mb: 2 }}>
                <Button
                    component={Link}
                    to="/rounds"
                    startIcon={<ArrowBackIcon />}
                    variant="outlined"
                >
                    Раунды
                </Button>
            </Box>

            <RoundStatus round={currentRound} onStatusChange={handleStatusChange} />
            <GooseGame round={currentRound} />
        </Box>
    )
}