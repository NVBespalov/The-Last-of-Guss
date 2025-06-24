import {useEffect} from 'react'
import {useForm} from 'react-hook-form'
import {yupResolver} from '@hookform/resolvers/yup'
import {Box, Paper, Typography, Alert} from '@mui/material'
import {useNavigate} from 'react-router-dom'
import {useAppDispatch, useAppSelector} from '@/shared'
import {loginUser, clearError} from '@/features'
import {loginSchema, LoginFormData} from '@/features'
import {Input, Button} from '@/shared'

export function LoginForm() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const {loading, error} = useAppSelector((state) => state.auth)
    const {
        register,
        handleSubmit,
        formState: {errors},
    } = useForm<LoginFormData>({
        resolver: yupResolver(loginSchema),
    })

    useEffect(() => {
        return () => {
            dispatch(clearError())
        }
    }, [dispatch])

    const onSubmit = async (data: LoginFormData) => {
        const resultAction = await dispatch(loginUser(data));

        // Проверяем статус выполнения
        if (loginUser.fulfilled.match(resultAction)) {
            // Действие успешно выполнено, можно продолжать
            navigate('/rounds');

        } else if (loginUser.rejected.match(resultAction)) {
            // Действие завершилось с ошибкой
            console.error('Ошибка входа:', resultAction.payload);
            // Здесь можно добавить обработку ошибки
        }


    }

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh',
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    width: '100%',
                    maxWidth: 400,
                }}
            >
                <Typography variant="h4" align="center" sx={{mb: 3}}>
                    ВОЙТИ
                </Typography>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <Input
                        label="Имя пользователя"
                        {...register('username')}
                        error={!!errors.username}
                        helperText={errors.username?.message}
                        disabled={loading}
                    />

                    <Input
                        label="Пароль"
                        type="password"
                        {...register('password')}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        disabled={loading}
                    />

                    {error && (
                        <Alert severity="error" sx={{mt: 2}}>
                            {error}
                        </Alert>
                    )}

                    <Box sx={{mt: 3}}>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Вход...' : 'Войти'}
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Box>
    )
}