import { Card, CardContent, Typography, Box, Chip } from '@mui/material'
import { Link } from 'react-router-dom'
import { Round } from '../model'
import { formatDate } from '../../../shared/lib'

interface RoundCardProps {
    round: Round
}

const getStatusColor = (status: Round['status']) => {
    switch (status) {
        case 'active':
            return 'success'
        case 'cooldown':
            return 'warning'
        case 'finished':
            return 'default'
        default:
            return 'default'
    }
}

const getStatusText = (status: Round['status']) => {
    switch (status) {
        case 'active':
            return 'Активен'
        case 'cooldown':
            return 'Cooldown'
        case 'finished':
            return 'Завершен'
        default:
            return 'Неизвестно'
    }
}

export function RoundCard({ round }: RoundCardProps) {
    return (
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Box sx={{ mb: 2 }}>
                    <Typography
                        variant="h6"
                        component={Link}
                        to={`/round/${round.id}`}
                        sx={{
                            textDecoration: 'none',
                            color: 'primary.main',
                            '&:hover': { textDecoration: 'underline' }
                        }}
                    >
                        ● Round ID: {round.id}
                    </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2">
                        Start: {formatDate(round.startDate)}
                    </Typography>
                    <Typography variant="body2">
                        End: {formatDate(round.endDate)}
                    </Typography>
                </Box>

                <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 1 }}>
                    <Chip
                        label={`Статус: ${getStatusText(round.status)}`}
                        color={getStatusColor(round.status)}
                        size="small"
                    />
                </Box>
            </CardContent>
        </Card>
    )
}