export interface Round {
    id: string
    startDate: string
    endDate: string
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

export interface CreateRoundData {
    name: string
    description?: string
    startDate: string
    endDate: string
    maxParticipants?: number
}

export interface RoundFormData {
    name: string
    description: string
    startDate: string
    duration: number // в минутах, для удобства ввода
    maxParticipants: number
}