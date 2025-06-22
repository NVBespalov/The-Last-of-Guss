import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import {GameState, RoundDetailsResponse, TapResponse} from './types'
import {gameApi} from '../api'
import {RoundTimeUpdate, RoundUpdate} from "@entities/round/model/types.ts";

const initialState: GameState = {
    currentRound: null,
    stats: null,
    loading: false,
    error: null,
    tapping: false,
}

export const fetchRoundDetails = createAsyncThunk<RoundDetailsResponse, string>(
    'game/fetchRoundDetails',
    async (roundId, {rejectWithValue}) => {
        try {
            return await gameApi.getRoundDetails(roundId)
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки раунда')
        }
    }
)

export const tapGoose = createAsyncThunk<TapResponse, string>(
    'game/tapGoose',
    async (roundId, {rejectWithValue}) => {
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
        updateRoundFromSocket: (state, {
            payload: {
                leaderboard,
                myScore,
                totalScore,
                totalTaps,
                myTaps,
                timeRemaining,
                timeLeft,
                winner,
                ...payload
            }
        }: PayloadAction<RoundUpdate>) => {

            if (state.currentRound) {
                state.currentRound = {
                    ...state.currentRound,
                    status: payload.status || state.currentRound.status,
                    winner: winner || state.currentRound.winner,
                    endTime: payload.endTime || state.currentRound.endTime,
                    startTime: payload.startTime || state.currentRound.startTime,
                }
                state.stats = {
                    myTaps: myTaps || state.stats?.myTaps || 0,
                    myScore: myScore || state.stats?.myScore || 0,
                    totalScore: totalScore || state.stats?.totalScore || 0,
                    totalTaps: totalTaps || state.stats?.totalTaps || 0,
                    timeRemaining: timeRemaining || state.stats?.timeRemaining || 0,
                    timeLeft: timeLeft || state.stats?.timeLeft || 0,
                }

            }
        },
        updateTimeFromSocket: (state, {payload: {timeRemaining = 0, timeLeft = 0}}: PayloadAction<RoundTimeUpdate>) => {
            if (state.currentRound) {
                state.stats = {
                    myScore: state.stats?.myScore || 0,
                    myTaps: state.stats?.myTaps || 0,
                    totalScore: state.stats?.totalScore || 0,
                    totalTaps: state.stats?.totalTaps || 0,
                    timeRemaining: timeRemaining || state.stats?.timeRemaining || 0,
                    timeLeft: timeLeft || state.stats?.timeLeft || 0,
                }
            }
        },
    },
    extraReducers:
        (builder) => {
            builder
                // Fetch round details
                .addCase(fetchRoundDetails.pending, (state) => {
                    state.loading = true
                    state.error = null
                })
                .addCase(fetchRoundDetails.fulfilled, (state, action: PayloadAction<RoundDetailsResponse>) => {
                    state.loading = false
                    const {
                        myTaps,
                        myScore,
                        totalScore,
                        totalTaps,
                        status,
                        id,
                        startTime,
                        endTime,
                        winner,
                    } = action.payload.data;
                    state.currentRound = {
                        ...state.currentRound ?? {},
                        id: id,
                        status: status,
                        endTime,
                        startTime,
                        winner: winner,
                    };
                    state.stats = {
                        ...state.stats,
                        myTaps,
                        myScore,
                        totalScore,
                        totalTaps,
                        timeLeft: 0,
                        timeRemaining: 0
                    };
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

                    if (state.stats) {
                        state.stats.myScore = action.payload.myScore
                        state.stats.myTaps = action.payload.myTaps
                        // state.stats.totalTaps = action.payload.totalTaps
                    }
                })
                .addCase(tapGoose.rejected, (state, action) => {
                    state.tapping = false
                    state.error = action.payload as string
                })
        },


})

export const {
    clearError: clearErrorGame,
    clearCurrentRound,
    updateRoundFromSocket,
    updateTimeFromSocket
} = gameSlice.actions