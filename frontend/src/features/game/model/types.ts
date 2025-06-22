import { Round, RoundStats } from '@/entities'
import {RoundBackend} from "@entities/round/model/types.ts";

export interface GameState {
    currentRound: Round | null
    stats: RoundStats | null
    loading: boolean
    error: string | null
    tapping: boolean
}

export interface TapResponse {
    myScore: number;
    myTaps: number;
    totalTaps?: number;
    totalScore?: number;
}

export interface RoundDetailsResponse {
    data: RoundBackend
}