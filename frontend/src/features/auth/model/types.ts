import { User } from '@/entities'

export interface AuthState {
    user: User | null
    isAuthenticated: boolean
    loading: boolean
    error: string | null
}

export interface LoginRequest {
    username: string
    password: string
}

export interface LoginResponse {
    data: {
        user: User,
        access_token: string
    }
}