import { useEffect } from 'react'
import { Box, Typography, Alert, CircularProgress, Fab } from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/shared'
import { fetchRounds } from '@/features'
import { RoundCard } from '@/entities'

export function RoundsList() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { rounds, loading, error } = useAppSelector((state) => state.rounds)
    const { user } = useAppSelector((state) => state.auth)

    useEffect(() => {
        dispatch(fetchRounds())
    }, [dispatch])

    const handleCreateRound = () => {
        navigate('/rounds/create')
    }

    if (loading && rounds.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        )
    }

    return (
        <Box>
            <Typography variant="h4" align="center" sx={{ mb: 3 }}>
                Список РАУНДОВ
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {user?.role === 'admin' && (
                <Box sx={{ mb: 3 }}>
                    <Fab
                        variant="extended"
                        color="primary"
                        onClick={handleCreateRound}
                        disabled={loading}
                    >
                        <AddIcon sx={{ mr: 1 }} />
                        Создать раунд
                    </Fab>
                </Box>
            )}

            <Box>
                {rounds.map((round) => (
                    <RoundCard key={round.id} round={round} />
                ))}
            </Box>

            {rounds.length === 0 && !loading && (
                <Typography variant="body1" align="center" color="text.secondary">
                    Нет доступных раундов
                </Typography>
            )}
        </Box>
    )
}