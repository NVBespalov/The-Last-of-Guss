import { apiClient } from '../../../shared/api'
import { Round } from '../../../entities/round'
import { CreateRoundRequest } from '../model/types'

export const roundsApi = {
    async getRounds(): Promise<Round[]> {
        const response = await apiClient.get('/rounds')

        return response.data.data
    },

    async createRound(data: CreateRoundRequest): Promise<Round> {
        const response = await apiClient.post('/rounds', data)
        return response.data
    },
}