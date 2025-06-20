
import { apiClient } from '../../../shared/api'
import { LoginRequest, LoginResponse } from '../model/types'
import { User } from '../../../entities/user'

export const authApi = {
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        const response = await apiClient.post('/auth/login', credentials)
        return response.data
    },

    async logout(): Promise<void> {
        await apiClient.post('/auth/logout')
    },

    async getMe(): Promise<User> {
        const response = await apiClient.get('/auth/profile')
        return response.data.data
    },
}