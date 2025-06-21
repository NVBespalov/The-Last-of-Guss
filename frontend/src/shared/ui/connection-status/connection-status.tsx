// src/shared/ui/connection-status/connection-status.tsx
import React from 'react';
import { Box, Chip, Alert, CircularProgress } from '@mui/material';
import {useWebSocket} from "@/shared";


interface ConnectionStatusProps {
    showError?: boolean;
    size?: 'small' | 'medium';
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
                                                                      showError = true,
                                                                      size = 'small'
                                                                  }) => {
    const { isConnected, connectionError } = useWebSocket();

    return (
        <Box>
            {showError && connectionError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    Ошибка подключения: {connectionError}
                </Alert>
            )}

            <Chip
                label={isConnected ? 'Подключено' : 'Отключено'}
                color={isConnected ? 'success' : 'error'}
                size={size}
                icon={!isConnected ? <CircularProgress size={16} /> : undefined}
            />
        </Box>
    );
};