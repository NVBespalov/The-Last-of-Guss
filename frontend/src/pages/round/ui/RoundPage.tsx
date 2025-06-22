import {useEffect} from 'react'
import {Link, Navigate, useParams} from 'react-router-dom'
import {Alert, Box, Button, CircularProgress} from '@mui/material'
import {ArrowBack as ArrowBackIcon} from '@mui/icons-material'
import {ConnectionStatus, useAppDispatch, useAppSelector, useRoundManager} from '@/shared'
import {clearCurrentRound, fetchRoundDetails} from '@/features'
import {Round, RoundStatus} from '@/entities'
import {GooseGame} from '@/widgets'

export function RoundPage() {
    const {id} = useParams<{ id: string }>()
    const dispatch = useAppDispatch()
    const {isAuthenticated, loading: authLoading} = useAppSelector((state) => state.auth)
    const {currentRound, loading, error} = useAppSelector((state) => state.game)

    useEffect(() => {
        if (id && isAuthenticated) {
            dispatch(fetchRoundDetails(id))
        }

        return () => {
            dispatch(clearCurrentRound())
        }
    }, [dispatch, id, isAuthenticated]);

    const {
        joinRound,
        leaveRound,
    } = useRoundManager(currentRound || {} as Round)

    useEffect(() => {
        joinRound()
        return () => {
            leaveRound()
        }
    }, [joinRound, leaveRound, currentRound]);

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
            <RoundStatus />
            <GooseGame round={currentRound}/>
        </Box>
    )
}