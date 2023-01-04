import { configureStore } from '@reduxjs/toolkit';
import boltzReducer from './boltz-slice';
import tdexReducer from './tdex-slice';

export const store = configureStore({
  reducer: {
    boltz: boltzReducer,
    tdex: tdexReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
