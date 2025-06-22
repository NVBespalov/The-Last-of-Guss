import React, {createContext, useEffect, useState, ReactNode, useCallback} from 'react';
import { websocketService } from '@/shared/api/websocket';
import { WebSocketState } from '@/shared/api/websocket';
import Socket = SocketIOClient.Socket;
import {env} from "@/shared";

export interface WebSocketContextValue extends WebSocketState {
    socket: Socket | null;
    connect: () => Promise<void>;
    disconnect: () => void;
    reconnect: () => Promise<void>;
}

export const WebSocketContext = createContext<WebSocketContextValue | undefined>(undefined);

interface WebSocketProviderProps {
    children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [reconnectAttempts, setReconnectAttempts] = useState(0);
    const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('token') || null);

    const tokenChangeListener = useCallback((event: StorageEvent) => {
        if (event.key === 'token') {
            setAuthToken(event.newValue);
        }
    }, []);

    const connect = async () => {
        if (!authToken) {
            setConnectionError('Authentication token is missing');
            setIsConnected(false);
            return;
        }

        try {
            setConnectionError(null);

            const socketInstance = await websocketService.initialize({
                url: env.WS_URL,
                auth: {
                    token: authToken,
                },
                reconnection: {
                    maxAttempts: 5,
                    delay: 1000,
                },
            });

            setSocket(socketInstance);
            setIsConnected(true);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Connection failed';
            setConnectionError(errorMessage);
            setIsConnected(false);
        }
    };

    const disconnect = () => {
        websocketService.disconnect();
        setSocket(null);
        setIsConnected(false);
        setReconnectAttempts(0);
    };

    const reconnect = async () => {
        setReconnectAttempts(prev => prev + 1);
        return connect();
    };

    useEffect(() => {
        if (!authToken) {
            disconnect();
            setConnectionError('Authentication token is missing');
            return;
        }
        void connect();

        window.addEventListener('storage', tokenChangeListener);
        return () => {
            disconnect();
            window.removeEventListener('storage', tokenChangeListener);
        };
    }, [authToken, tokenChangeListener]);

    useEffect(() => {
        const handleConnect = () => {
            setIsConnected(true);
            setConnectionError(null);
            setReconnectAttempts(0);
        };

        const handleDisconnect = () => {
            setIsConnected(false);
        };

        const handleError = (error: any) => {
            setConnectionError(error?.message || 'WebSocket error');
        };

        websocketService.on('connect', handleConnect);
        websocketService.on('disconnect', handleDisconnect);
        websocketService.on('error', handleError);

        return () => {
            websocketService.off('connect', handleConnect);
            websocketService.off('disconnect', handleDisconnect);
            websocketService.off('error', handleError);
        };
    }, []);

    return (
        <WebSocketContext.Provider
            value={{
                socket,
                isConnected,
                connectionError,
                reconnectAttempts,
                connect,
                disconnect,
                reconnect,
            }}
        >
            {children}
        </WebSocketContext.Provider>
    );
};