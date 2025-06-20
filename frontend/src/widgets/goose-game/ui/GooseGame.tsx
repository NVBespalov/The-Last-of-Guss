import { Box, Typography, Alert, Divider } from '@mui/material'
import { useAppDispatch, useAppSelector } from '../../../shared/lib'
import { tapGoose } from '../../../features/game'
import { Round } from '../../../entities/round'

interface GooseGameProps {
    round: Round
}

const GooseArt = `
            ░░░░░░░░░░░░░░░
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
    const { tapping, error } = useAppSelector((state) => state.game)

    const handleTap = () => {
        if (round.status === 'active' && !tapping) {
            dispatch(tapGoose(round.id))
        }
    }

    const isClickable = round.status === 'active' && !tapping

    return (
        <Box sx={{ textAlign: 'center' }}>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Box
                onClick={handleTap}
                sx={{
                    cursor: isClickable ? 'pointer' : 'default',
                    userSelect: 'none',
                    fontFamily: 'monospace',
                    fontSize: '10px',
                    lineHeight: 1,
                    whiteSpace: 'pre',
                    display: 'inline-block',
                    padding: 2,
                    border: isClickable ? '2px solid transparent' : 'none',
                    borderRadius: 2,
                    transition: 'all 0.2s',
                    '&:hover': isClickable ? {
                        borderColor: 'primary.main',
                        backgroundColor: 'action.hover',
                        transform: 'scale(1.02)',
                    } : {},
                    '&:active': isClickable ? {
                        transform: 'scale(0.98)',
                    } : {},
                    opacity: tapping ? 0.7 : 1,
                }}
            >
                {GooseArt}
            </Box>

            {round.status === 'finished' && round.winner && (
                <Box sx={{ mt: 3 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        Всего: {round.totalTaps}
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        Победитель - {round.winner.username}: {round.winner.score}
                    </Typography>
                    <Typography variant="h6">
                        Мои очки: {round.myScore || 0}
                    </Typography>
                </Box>
            )}
        </Box>
    )
}