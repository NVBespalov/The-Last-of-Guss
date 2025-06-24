export interface Round {
    id?: string
    startTime: Date | string;
    endTime: Date | string;
    status: RoundStatus
    winner?: {
        username: string
        score: number
    }
}
export interface RoundBackend {
    id: string;
    status: RoundStatus
    startTime: string
    endTime: string
    myScore: number;
    myTaps:number;
    totalScore: number;
    totalTaps:number;
    winner?: {
        username: string
        score: number
    }
}

export interface RoundStats {
    totalTaps: number;
    totalScore: number;
}

export interface RoundMyStats {
    taps: number;
    score: number;
}


export enum RoundStatus {
    ACTIVE = 'active',
    COOLDOWN = 'cooldown',
    FINISHED = 'finished'
}


export interface RoundUpdate {
    status: RoundStatus;
    startTime?: Date;
    endTime?: Date;
    timeRemaining?: number;
    timeLeft?: number;
    winner?: {
        username: string;
        score: number;
    };
    leaderboard?: Array<{
        userId: string;
        username: string;
        taps: number;
        score: number;
    }>,
    totalTaps?: number;
    totalScore?: number;
    myScore?: number;
    myTaps?: number;
}


export interface RoundTimeUpdate {
    timeRemaining?: number;
    timeLeft?: number;
}