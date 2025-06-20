import { Round } from '../../../entities/round'

export interface RoundsState {
    rounds: Round[]
    loading: boolean
    error: string | null
}

export interface CreateRoundRequest {
    // Дополнительные параметры для создания раунда, если нужны
}