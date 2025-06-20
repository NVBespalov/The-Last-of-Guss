import { Typography, Box } from '@mui/material'
import { Round } from '../model'
import { formatTime } from '../../../shared/lib'
import { useCountdown } from '../../../shared/lib/hooks'

interface RoundStatusProps {
    round: Round
    onStatusChange?: () => void
}

export function RoundStatus({ round, onStatusChange }: RoundStatusProps) {
    const targetDate = round.status === 'active' ? round.endDate : round.startDate
    const timeLeft = useCountdown(targetDate, onStatusChange)

    const getStatusText = () => {
        switch (round.status) {
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
        switch (round.status) {
            case 'active':
                return `До конца осталось: ${formatTime(timeLeft)}`
            case 'cooldown':
                return `до начала раунда ${formatTime(timeLeft)}`
            default:
                return ''
        }
    }

    return (
        <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ mb: 1 }}>
                {getStatusText()}
            </Typography>
            {(round.status === 'active' || round.status === 'cooldown') && (
                <Typography variant="h6" color="text.secondary">
                    {getTimeText()}
                </Typography>
            )}
            {round.status === 'active' && (
                <Typography variant="h6" sx={{ mt: 1 }}>
                    Мои очки - {round.myScore || 0}
                </Typography>
            )}
        </Box>
    )
}