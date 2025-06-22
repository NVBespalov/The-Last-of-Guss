import React, {useEffect} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigate} from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    FormControl,
    Grid,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    Paper,
    TextField,
    Typography,
} from '@mui/material';
import {AccessTime,} from '@mui/icons-material';

import {
    clearError,
    createRound,
    type CreateRoundData,
    resetState,
    type RoundFormData,
    roundFormSchema
} from '@/features';
import {AppDispatch, RootState} from "@app/providers/store";


export const CreateRoundForm: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const {isCreating, error, createdRound} = useSelector((state: RootState) => state.createRound);

    const {
        handleSubmit,
        control,
        reset,
        formState: {errors, isValid},
    } = useForm<RoundFormData>({
        resolver: yupResolver(roundFormSchema),
        defaultValues: {
            startTime: '',
            duration: 30,
        },
        mode: 'onChange',
    });

    useEffect(() => {
        return () => {
            dispatch(resetState());
        };
    }, [dispatch]);

    useEffect(() => {
        if (createdRound) {
            reset();
            navigate('/rounds');
        }
    }, [createdRound, reset, navigate]);

    const onSubmit = (data: RoundFormData) => {
        const startDateTime = new Date(data.startTime);

        const createData: CreateRoundData = {
            startTime: startDateTime.toISOString(),
            duration: data.duration,
        };

        dispatch(createRound(createData));
    };

    const handleCancel = () => {
        reset();
        navigate('/rounds');
    };

    const getMinDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 5);
        return now.toISOString().slice(0, 16);
    };

    return (
        <Box sx={{maxWidth: 800, mx: 'auto', p: 3}}>
            <Paper elevation={3} sx={{p: 4}}>
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3}}>
                    <Box>
                        <Typography variant="h4" component="h1" gutterBottom>
                            Создание нового раунда
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Заполните информацию для создания нового игрового раунда
                        </Typography>
                    </Box>
                </Box>

                {error && (
                    <Alert severity="error" sx={{mb: 3}} onClose={() => dispatch(clearError())}>
                        {error}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <Grid container spacing={3}>

                        <Grid component="div" sx={{width: '48%'}}>
                            <Controller
                                name="startTime"
                                control={control}
                                render={({field}) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        type="datetime-local"
                                        label="Время начала"
                                        error={!!errors.startTime}
                                        helperText={errors.startTime?.message}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        inputProps={{
                                            min: getMinDateTime(),
                                        }}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid component="div" sx={{mb: 2, width: '48%'}}>
                            <Controller
                                name="duration"
                                control={control}
                                render={({field}) => (
                                    <FormControl fullWidth error={!!errors.duration}>
                                        <InputLabel htmlFor="duration-input">Продолжительность</InputLabel>
                                        <OutlinedInput
                                            {...field}
                                            id="duration-input"
                                            type="number"
                                            label="Продолжительность"
                                            placeholder="30"
                                            inputProps={{
                                                min: 1,
                                                max: 1440,
                                            }}
                                            startAdornment={
                                                <InputAdornment position="start">
                                                    <AccessTime/>
                                                </InputAdornment>
                                            }
                                            endAdornment={
                                                <InputAdornment position="end">мин</InputAdornment>
                                            }
                                        />
                                        {errors.duration && (
                                            <Typography variant="caption" color="error" sx={{mt: 0.5, ml: 1.5}}>
                                                {errors.duration.message}
                                            </Typography>
                                        )}
                                    </FormControl>
                                )}
                            />
                        </Grid>
                        <Grid component="div" sx={{mb: 2, width: '100%'}}>
                            <Box sx={{display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2}}>
                                <Button
                                    variant="outlined"
                                    onClick={handleCancel}
                                    disabled={isCreating}
                                    size="large"
                                >
                                    Отмена
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={!isValid || isCreating}
                                    size="large"
                                    sx={{minWidth: 120}}
                                    startIcon={isCreating ? <CircularProgress size={20} color="inherit"/> : undefined}
                                >
                                    {isCreating ? 'Создание...' : 'Создать раунд'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Box>
    );
};