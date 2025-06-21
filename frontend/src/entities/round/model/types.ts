export interface Round {
    id: string
    startTime: string
    endTime: string
    status: 'cooldown' | 'active' | 'finished'
    totalTaps: number
    winner?: {
        username: string
        score: number
    }
    myScore?: number
    name?: string
    description?: string
    maxParticipants?: number
}

export interface RoundStats {
    totalTaps: number
    myTaps: number
    myScore: number
}