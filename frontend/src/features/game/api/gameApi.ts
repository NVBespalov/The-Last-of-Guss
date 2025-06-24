import { apiClient } from '@/shared'
import {TapResponse, RoundDetailsResponse, RoundStatisticResponse, RoundMyStatisticResponse} from '../model/types'

export const gameApi = {
    async getRoundDetails(roundId: string): Promise<RoundDetailsResponse> {
        const response = await apiClient.get(`/rounds/${roundId}`)
        return response.data
    },
    async getRoundStatistic(roundId: string): Promise<RoundStatisticResponse> {
        const response = await apiClient.get(`/game/rounds/${roundId}/stats`)
        return response.data
    },
    async getRoundMyStatistic(roundId: string): Promise<RoundMyStatisticResponse> {
        const response = await apiClient.get(`/game/rounds/${roundId}/my-stats`)
        return response.data
    },

    async tap(roundId: string): Promise<TapResponse> {
        const response = await apiClient.post(`/game/rounds/${roundId}/tap`)
        return response.data
    },
}