import {Box, Typography} from '@mui/material'
import {formatTime} from '@/shared'
import {useSelector} from "react-redux";


export function RoundStatus() {
    const {stats, currentRound} = useSelector((state: any) => state.game) || {};

    const getStatusText = () => {
        switch (currentRound.status) {
            case 'active':
                return 'Раунд активен!'
            case 'cooldown':
                return 'Cooldown'
            case 'finished':
                return 'Раунд завершен'
            default:
                return ''
        }
    }

    const getTimeText = () => {
        switch (currentRound?.status) {
            case 'active':
                return `До конца осталось: ${formatTime(stats?.timeLeft || 0)}`
            case 'cooldown':
                return `до начала раунда ${formatTime(stats?.timeRemaining || 0)}`
            default:
                return ''
        }
    }

    return (
        <Box sx={{textAlign: 'center', mb: 3}}>
            <Typography variant="h5" sx={{mb: 1}}>
                {getStatusText()}
            </Typography>
            {(currentRound?.status === 'active' || currentRound?.status === 'cooldown') && (
                <Typography variant="h6" color="text.secondary">
                    {getTimeText()}
                </Typography>
            )}
            {currentRound.status === 'active' && (
                <Typography variant="h6" sx={{mt: 1}}>
                    Мои очки - {stats?.myScore || 0}
                </Typography>
            )}
            {currentRound.status === 'finished' && (
                <>
                    <Typography variant="h6" sx={{mt: 1}}>
                        Всего - {stats.totalScore}
                    </Typography>
                    <Typography variant="h6" sx={{mt: 1}}>
                        Победитель - {currentRound.winner.username} {currentRound.winner.score}
                    </Typography>
                </>
            )}
        </Box>
    )
}