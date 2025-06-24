import {Box, Typography} from '@mui/material'
import {formatTime, useAppDispatch, useCountdown} from '@/shared'
import {useSelector} from "react-redux";
import {RootState} from "@app/providers/store";
import {useMemo} from 'react';
import {fetchRoundDetails} from "@features/game/model/slice.ts";


export function RoundStatus() {
    const {myStats, currentRound, roundStats} = useSelector((state: RootState) => state.game) || {};
    const {role} = useSelector((state: RootState) => state.auth.user) || {};
    const targetDate = currentRound?.status === 'active' ? currentRound?.endTime : currentRound?.startTime
    const dispatch = useAppDispatch();

    const timeLeft = useCountdown(targetDate || '', () => {

        setTimeout(() => {
            if (currentRound?.id) {
                dispatch(fetchRoundDetails(currentRound?.id));
            }
        }, 2000)
    });


    const myScore = useMemo(() => {
        if (role === 'nikita') return 0;
        const taps = myStats?.taps || 0;
        const regularPoints = taps;
        const bonusPoints = Math.floor(taps / 11) * 10;
        // Общее количество очков
        return regularPoints + bonusPoints;
    }, [myStats?.taps, role]);


    const getStatusText = () => {
        switch (currentRound?.status) {
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
                return `До конца осталось: ${formatTime(timeLeft || 0)}`
            case 'cooldown':
                return `до начала раунда ${formatTime(timeLeft || 0)}`
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
            <Typography variant="h6" sx={{mt: 1}}>
                Мои очки - {myScore}
            </Typography>
            {currentRound?.status === 'finished' && (
                <>
                    <Typography variant="h6" sx={{mt: 1}}>
                        Всего - {roundStats?.totalScore}
                    </Typography>
                    <Typography variant="h6" sx={{mt: 1}}>
                        Победитель - {currentRound?.winner?.username} {currentRound?.winner?.score}
                    </Typography>
                </>
            )}
        </Box>
    )
}