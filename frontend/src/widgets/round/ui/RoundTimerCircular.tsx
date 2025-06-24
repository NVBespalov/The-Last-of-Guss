// components/RoundTimerCircular.tsx
import React from 'react';
import {Box, Typography, CircularProgress} from '@mui/material';
import {useCountdown} from '@/shared';

interface RoundTimerCircularProps {
    targetDate: string | Date;
    onComplete?: () => void;
    size?: number;
    thickness?: number;
}

export const RoundTimerCircular: React.FC<RoundTimerCircularProps> = ({
                                                                          targetDate,
                                                                          onComplete,
                                                                          size = 80,
                                                                          thickness = 4
                                                                      }) => {
    const totalSeconds = useCountdown(targetDate, onComplete);

    const maxSeconds = 300;

    const progress = Math.min(100, (totalSeconds / maxSeconds) * 100);

    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <Box sx={{position: 'relative', display: 'inline-flex'}}>
            <CircularProgress
                variant="determinate"
                value={progress}
                size={size}
                thickness={thickness}
                sx={{
                    color: progress < 25 ? 'error.main' : 'primary.main',
                    // Переворачиваем направление прогресса, чтобы он уменьшался со временем
                    transform: 'rotate(180deg)'
                }}
            />
            <Box
                sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Typography variant="caption" component="div" color="text.secondary">
                    {formatTime(totalSeconds)}
                </Typography>
            </Box>
        </Box>
    );
};