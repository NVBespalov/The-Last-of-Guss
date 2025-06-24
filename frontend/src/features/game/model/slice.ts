import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import {GameState, RoundDetailsResponse, TapResponse} from './types'
import {gameApi} from '../api'


const initialState: GameState = {
    currentRound: null,
    myStats: {
        taps: 0,
        score: 0,
    },
    roundStats: {
        totalScore: 0,
        totalTaps: 0,
    },
    roundDetailsLoading: false,
    roundStatsLoading: false,
    myRoundStatsLoading: false,
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
export const fetchRoundStatistics = createAsyncThunk(
    'game/fetchRoundStatistics',
    async (roundId: string, {rejectWithValue}) => {
        try {
            const response = await gameApi.getRoundStatistic(roundId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Ошибка при получении статистики');
        }
    }
);
export const fetchRoundMyStatistics = createAsyncThunk(
    'game/fetchRoundMyStatistics',
    async (roundId: string, {rejectWithValue}) => {
        try {
            const response = await gameApi.getRoundMyStatistic(roundId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Ошибка при получении статистики');
        }
    }
);


export const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null
        },
        clearCurrentRound: (state) => {
            state.currentRound = null
            state.myStats = {
                taps: 0,
                score: 0,
            }
            state.roundStats = {
                totalScore: 0,
                totalTaps: 0,
            }

        },
        incrementLocalTapCount: (state) => {
            if (state.myStats) {
                state.myStats.taps += 1;
            } else {
                state.myStats = {
                    taps: 1,
                    score: 0,
                }
            }
        },
    },
    extraReducers:
        (builder) => {
            builder
                // Fetch round details
                .addCase(fetchRoundDetails.pending, (state) => {
                    state.roundDetailsLoading = true
                    state.error = null
                })
                .addCase(fetchRoundDetails.fulfilled, (state, action: PayloadAction<RoundDetailsResponse>) => {
                    state.roundDetailsLoading = false
                    state.currentRound = {
                        ...state.currentRound,
                        id: action.payload.data.id,
                        startTime: action.payload.data.startTime,
                        endTime: action.payload.data.endTime,
                        status: action.payload.data.status,
                        winner: action.payload.data.winner,
                    }
                })
                .addCase(fetchRoundDetails.rejected, (state, action) => {
                    state.roundDetailsLoading = false
                    state.error = action.payload as string
                })
                // Tap goose
                .addCase(tapGoose.pending, (state) => {
                    state.tapping = true
                    state.error = null
                })
                .addCase(tapGoose.fulfilled, (state) => {
                    state.tapping = false
                })
                .addCase(tapGoose.rejected, (state, action) => {
                    state.tapping = false
                    state.error = action.payload as string
                })
                // Обработка получения статистики
                .addCase(fetchRoundStatistics.pending, (state) => {
                    state.error = null;
                    state.roundStatsLoading = true;
                })
                .addCase(fetchRoundStatistics.fulfilled, (state, action) => {
                    state.roundStats = action.payload;
                    state.roundStatsLoading = false;
                })
                .addCase(fetchRoundStatistics.rejected, (state, action) => {
                    state.error = action.payload as string || 'Ошибка при получении статистики';
                    state.roundStatsLoading = false;
                })
                // Обработка получения собственной статистики
                .addCase(fetchRoundMyStatistics.pending, (state) => {
                    state.myRoundStatsLoading = true;
                    state.error = null;
                })
                .addCase(fetchRoundMyStatistics.fulfilled, (state, action) => {
                    state.myRoundStatsLoading = false;
                    state.myStats = action.payload;
                })
                .addCase(fetchRoundMyStatistics.rejected, (state, action) => {
                    state.myRoundStatsLoading = false;
                    state.error = action.payload as string || 'Ошибка при получении статистики';
                });

        },


})

export const {
    clearError: clearErrorGame,
    clearCurrentRound,
    incrementLocalTapCount,
} = gameSlice.actions