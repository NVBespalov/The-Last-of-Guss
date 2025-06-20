import { configureStore } from '@reduxjs/toolkit'
import { authSlice, roundsSlice, createRoundSlice, gameSlice } from '@/features'



export const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        rounds: roundsSlice.reducer,
        game: gameSlice.reducer,
        createRound: createRoundSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST'],
            },
        }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch