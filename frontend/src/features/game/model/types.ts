import {Round, RoundStats} from '@/entities'
import {RoundBackend, RoundMyStats} from "@entities/round/model/types.ts";

export interface GameState {
    currentRound: Round | null
    roundStats: RoundStats | null
    myStats: RoundMyStats
    roundDetailsLoading: boolean
    roundStatsLoading: boolean
    myRoundStatsLoading: boolean
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

export interface RoundStatisticResponse {
    data: RoundStats
}

export interface RoundMyStatisticResponse {
    data: RoundMyStats
}