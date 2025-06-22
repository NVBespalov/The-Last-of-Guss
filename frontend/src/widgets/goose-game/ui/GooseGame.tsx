import {Alert, Box} from '@mui/material'
import {useAppSelector, useRoundManager} from '@/shared'
import {Round} from '@/entities'

interface GooseGameProps {
    round: Round
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
    const { tapping, error, } = useAppSelector((state) => {
        return {...state.game};
    })
    const {tap} = useRoundManager(round)
    const isClickable = round?.status === 'active' && !tapping

    return (
        <Box sx={{ textAlign: 'center', maxWidth: 400, mx: 'auto', p: 2 }}>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            <Box
                onClick={tap}
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