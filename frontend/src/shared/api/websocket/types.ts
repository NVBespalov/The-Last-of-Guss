// src/shared/api/websocket/types.ts
export interface WebSocketConfig {
    url: string;
    auth?: {
        token?: string;
    };
    reconnection?: {
        maxAttempts: number;
        delay: number;
    };
}

export interface SocketEvents {
    // События раундов
    'round:created': (data: RoundEventData) => void;
    'round:started': (data: RoundEventData) => void;
    'round:ended': (data: RoundEventData) => void;
    'round:updated': (data: RoundEventData) => void;

    // События участников
    'participant:joined': (data: ParticipantEventData) => void;
    'participant:left': (data: ParticipantEventData) => void;

    // Системные события
    'connect': () => void;
    'disconnect': () => void;
    'error': (error: any) => void;
}

export interface RoundEventData {
    id: string;
    name: string;
    status: 'created' | 'started' | 'ended';
    startDate: string;
    endDate: string;
    participants: number;
    maxParticipants?: number;
}

export interface ParticipantEventData {
    roundId: string;
    userId: string;
    username: string;
    participantCount: number;
}

export interface WebSocketState {
    isConnected: boolean;
    connectionError: string | null;
    reconnectAttempts: number;
}