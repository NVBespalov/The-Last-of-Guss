import { WebSocketConfig, SocketEvents } from './types';
import Socket = SocketIOClient.Socket;
import * as io from 'socket.io-client';


class WebSocketService {
    private socket: Socket | null = null;
    private config: WebSocketConfig | null = null;
    private reconnectAttempts = 0;
    private listeners = new Map<string, Set<Function>>();

    initialize(config: WebSocketConfig): Promise<Socket> {
        this.config = config;

        return new Promise((resolve, reject) => {
            try {
                debugger
                this.socket = io.connect(config.url, {
                    auth: config.auth,
                    transports: ['websocket'],
                    timeout: 20000,
                    reconnection: true,
                    reconnectionAttempts: config.reconnection?.maxAttempts ?? 5,
                    reconnectionDelay: config.reconnection?.delay ?? 1000,
                });

                this.setupEventHandlers();

                this.socket.on('connect', () => {
                    console.log('WebSocket connected');
                    this.reconnectAttempts = 0;
                    resolve(this.socket!);
                });

                this.socket.on('connect_error', (error) => {
                    console.error('WebSocket connection error:', error);
                    reject(error);
                });

            } catch (error) {
                reject(error);
            }
        });
    }

    private setupEventHandlers() {
        if (!this.socket) return;

        this.socket.on('disconnect', (reason) => {
            console.log('WebSocket disconnected:', reason);
            this.emitToListeners('disconnect', reason);
        });

        this.socket.on('connect', () => {
            this.emitToListeners('connect');
        });

        this.socket.on('error', (error) => {
            this.emitToListeners('error', error);
        });
    }

    on<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(callback);

        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    off<K extends keyof SocketEvents>(event: K, callback?: SocketEvents[K]) {
        if (callback) {
            this.listeners.get(event)?.delete(callback);
        } else {
            this.listeners.delete(event);
        }

        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    emit(event: string, data?: any) {
        if (this.socket?.connected) {
            this.socket.emit(event, data);
        }
    }

    private emitToListeners(event: string, data?: any) {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.forEach(callback => callback(data));
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.listeners.clear();
    }

    isConnected(): boolean {
        return this.socket?.connected ?? false;
    }

    getSocket(): Socket | null {
        return this.socket;
    }

    reconnect() {
        if (this.config) {
            this.disconnect();
            return this.initialize(this.config);
        }
        return Promise.reject(new Error('WebSocket not configured'));
    }
}

export const websocketService = new WebSocketService();