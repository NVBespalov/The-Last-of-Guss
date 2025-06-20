import { Typography, Box } from '@mui/material'
import { User } from '../model'

interface UserInfoProps {
    user: User | null
}

export function UserInfo({ user }: UserInfoProps) {
    if (!user) return null

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body1" color="inherit">
                {user.username}
            </Typography>
            {user.role === 'admin' && (
                <Typography variant="caption" color="secondary">
                    (Админ)
                </Typography>
            )}
        </Box>
    )
}