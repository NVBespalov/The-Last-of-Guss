import { useEffect } from 'react'
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import {ConnectionStatus, useAppDispatch, useAppSelector, useWebSocket} from '@/shared'
import { logoutUser, checkAuth } from '@/features'
import { UserInfo } from '@/entities'

export function Header() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { user, isAuthenticated } = useAppSelector((state) => state.auth)
    const {disconnect} = useWebSocket();
    useEffect(() => {
        dispatch(checkAuth())
    }, [dispatch])

    const handleLogout = async () => {
        await dispatch(logoutUser());
        navigate('/login');
        disconnect();
    }

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    The Last of Guss
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                    <ConnectionStatus showError={false} />
                </Box>

                {isAuthenticated && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button
                            color="inherit"
                            component={Link}
                            to="/rounds"
                        >
                            Раунды
                        </Button>
                        <UserInfo user={user} />
                        <Button color="inherit" onClick={handleLogout}>
                            Выйти
                        </Button>
                    </Box>
                )}

            </Toolbar>
        </AppBar>
    )
}