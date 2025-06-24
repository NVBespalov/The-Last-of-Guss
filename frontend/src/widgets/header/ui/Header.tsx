import {AppBar, Box, Button, Toolbar, Typography} from '@mui/material'
import {Link, useNavigate} from 'react-router-dom'
import {useAppDispatch, useAppSelector} from '@/shared'
import {logoutUser} from '@/features'
import {UserInfo} from '@/entities'

export function Header() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { user, isAuthenticated } = useAppSelector((state) => state.auth)


    const handleLogout = async () => {
        await dispatch(logoutUser());
        navigate('/login');
    }

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    The Last of Guss
                </Typography>
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