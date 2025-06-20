import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { RoundsState } from './types'
import { Round } from '../../../entities/round'
import { roundsApi } from '../api'

const initialState: RoundsState = {
    rounds: [],
    loading: false,
    error: null,
}

export const fetchRounds = createAsyncThunk<Round[]>(
    'rounds/fetchRounds',
    async (_, { rejectWithValue }) => {
        try {
            return await roundsApi.getRounds()
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки раундов')
        }
    }
)

export const roundsSlice = createSlice({
    name: 'rounds',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch rounds
            .addCase(fetchRounds.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchRounds.fulfilled, (state, action: PayloadAction<Round[]>) => {
                state.loading = false
                state.rounds = action.payload
            })
            .addCase(fetchRounds.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })

    },
})

export const { clearError: clearErrorRounds } = roundsSlice.actions