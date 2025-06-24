import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import {AuthState, LoginRequest, LoginResponse} from './types'
import {authApi} from '../api'
import {User} from "@/entities";

const initialState: AuthState = {
    user: null,
    isAuthenticated: localStorage.getItem('token') !== null,
    loading: false,
    error: null,
}

export const loginUser = createAsyncThunk<LoginResponse, LoginRequest>(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await authApi.login(credentials)
            localStorage.setItem('token', response.data.access_token)
            return response
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Ошибка входа')
        }
    }
)

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await authApi.logout()
            localStorage.removeItem('token')
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Ошибка выхода')
        }
    }
)

export const checkAuth = createAsyncThunk(
    'auth/checkAuth',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('No token')
            }
            return await authApi.getMe();
        } catch (error: any) {
            localStorage.removeItem('token')
            return rejectWithValue('Не авторизован')
        }
    }
)

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(loginUser.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(loginUser.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
                state.loading = false
                state.user = action.payload.data.user
                state.isAuthenticated = true
                state.error = null
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
                state.isAuthenticated = false
            })
            // Logout
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null
                state.isAuthenticated = false
                state.error = null
            })
            // Check Auth
            .addCase(checkAuth.pending, (state) => {
                state.loading = true
            })
            .addCase(checkAuth.fulfilled, (state, action: PayloadAction<User>) => {
                state.loading = false
                state.user = action.payload
                state.isAuthenticated = true
            })
            .addCase(checkAuth.rejected, (state) => {
                state.loading = false
                state.user = null
                state.isAuthenticated = false
            })
    },
})

export const { clearError } = authSlice.actions