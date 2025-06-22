export interface Round {
    id?: string
    startTime: Date | string;
    endTime: Date | string;
    status: 'cooldown' | 'active' | 'finished'
    winner?: {
        username: string
        score: number
    }
}
export interface RoundBackend {
    id: string;
    status: 'cooldown' | 'active' | 'finished'
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
    myTaps: number
    myScore: number
    timeLeft: number;
    timeRemaining: number;
    totalTaps: number;
    totalScore: number;
}

export type RoundStatus = 'active' | 'cooldown' | 'finished';


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