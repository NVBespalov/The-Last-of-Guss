import { Round, RoundStats } from '@/entities'

export interface GameState {
    currentRound: Round | null
    stats: RoundStats | null
    loading: boolean
    error: string | null
    tapping: boolean
}

export interface TapResponse {
    myScore: number
    myTaps: number
    totalTaps: number
}

export interface RoundDetailsResponse {
    data: Round
}