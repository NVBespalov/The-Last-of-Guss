import {useEffect} from 'react'
import {Link, Navigate, useParams} from 'react-router-dom'
import {Alert, Box, Button, CircularProgress} from '@mui/material'
import {ArrowBack as ArrowBackIcon} from '@mui/icons-material'
import {useAppDispatch, useAppSelector} from '@/shared'
import {clearCurrentRound, fetchRoundDetails} from '@/features'
import {RoundStatus} from '@/entities'
import {GooseGame} from '@/widgets'

export function RoundPage() {
    const {id} = useParams<{ id: string }>()
    const dispatch = useAppDispatch()
    const {isAuthenticated, loading: authLoading} = useAppSelector((state) => state.auth)
    const {currentRound, error, roundDetailsLoading} = useAppSelector((state) => state.game)

    useEffect(() => {
        if (id && isAuthenticated) {
            dispatch(fetchRoundDetails(id))
        }

        return () => {
            dispatch(clearCurrentRound())
        }
    }, [dispatch, id, isAuthenticated]);

    if (authLoading) {
        return null
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace/>
    }

    if (!id) {
        return <Navigate to="/rounds" replace/>
    }

    if (roundDetailsLoading && !currentRound) {
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
            <RoundStatus/>
            <GooseGame round={currentRound}/>
        </Box>
    )
}