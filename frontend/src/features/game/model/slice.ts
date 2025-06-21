import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { GameState, TapResponse, RoundDetailsResponse } from './types'
import { gameApi } from '../api'

const initialState: GameState = {
    currentRound: null,
    stats: null,
    loading: false,
    error: null,
    tapping: false,
}

export const fetchRoundDetails = createAsyncThunk<RoundDetailsResponse, string>(
    'game/fetchRoundDetails',
    async (roundId, { rejectWithValue }) => {
        try {
            const response = await gameApi.getRoundDetails(roundId);
            return response?.data
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки раунда')
        }
    }
)

export const tapGoose = createAsyncThunk<TapResponse, string>(
    'game/tapGoose',
    async (roundId, { rejectWithValue }) => {
        try {
            return await gameApi.tap(roundId)
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Ошибка тапа')
        }
    }
)

export const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null
        },
        clearCurrentRound: (state) => {
            state.currentRound = null
            state.stats = null
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch round details
            .addCase(fetchRoundDetails.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchRoundDetails.fulfilled, (state, action: PayloadAction<RoundDetailsResponse>) => {
                state.loading = false
                state.currentRound = action.payload
                state.stats = action.payload.stats
            })
            .addCase(fetchRoundDetails.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            // Tap goose
            .addCase(tapGoose.pending, (state) => {
                state.tapping = true
                state.error = null
            })
            .addCase(tapGoose.fulfilled, (state, action: PayloadAction<TapResponse>) => {
                state.tapping = false
                if (state.currentRound) {
                    state.currentRound.myScore = action.payload.myScore
                    state.currentRound.totalTaps = action.payload.totalTaps
                }
                if (state.stats) {
                    state.stats.myScore = action.payload.myScore
                    state.stats.myTaps = action.payload.myTaps
                    state.stats.totalTaps = action.payload.totalTaps
                }
            })
            .addCase(tapGoose.rejected, (state, action) => {
                state.tapping = false
                state.error = action.payload as string
            })
    },
})

export const { clearError: clearErrorGame, clearCurrentRound } = gameSlice.actions