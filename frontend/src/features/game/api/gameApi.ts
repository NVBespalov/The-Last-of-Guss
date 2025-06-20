import { apiClient } from '../../../shared/api'
import { TapResponse, RoundDetailsResponse } from '../model/types'

export const gameApi = {
    async getRoundDetails(roundId: string): Promise<RoundDetailsResponse> {
        const response = await apiClient.get(`/rounds/${roundId}`)
        return response.data
    },

    async tap(roundId: string): Promise<TapResponse> {
        const response = await apiClient.post(`/rounds/${roundId}/tap`)
        return response.data
    },
}