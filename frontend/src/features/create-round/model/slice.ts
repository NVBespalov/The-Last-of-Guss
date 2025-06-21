import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import type {Round} from '@entities/round';
import type {CreateRoundData} from '@/features';
import {roundApi} from '@/features';

export interface CreateRoundState {
    isCreating: boolean;
    error: string | null;
    createdRound: Round | null;
}

const initialState: CreateRoundState = {
    isCreating: false,
    error: null,
    createdRound: null,
};

export const createRound = createAsyncThunk(
    'createRound/createRound',
    async (data: CreateRoundData, { rejectWithValue }) => {
        try {
            return await roundApi.createRound(data);
        } catch (error: any) {
            return rejectWithValue(error.message || 'Ошибка при создании раунда');
        }
    }
);

export const createRoundSlice = createSlice({
    name: 'createRound',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        resetState: (state) => {
            state.isCreating = false;
            state.error = null;
            state.createdRound = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createRound.pending, (state) => {
                state.isCreating = true;
                state.error = null;
            })
            .addCase(createRound.fulfilled, (state, action) => {
                state.isCreating = false;
                state.createdRound = action.payload;
            })
            .addCase(createRound.rejected, (state, action) => {
                state.isCreating = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError: clearErrorCreateRound, resetState } = createRoundSlice.actions;