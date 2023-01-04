import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProviderWithMarket } from '../components/TdexSwapFlow/constants';
import { RootState } from './index';

// Define a type for the slice state
interface TdexState {
  bestProvider?: ProviderWithMarket;
}

// Define the initial state using that type
export const initialState: TdexState = {
  bestProvider: undefined,
};

export const tdexSlice = createSlice({
  name: 'tdex',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    setBestProvider: (state, action: PayloadAction<ProviderWithMarket>) => {
      state.bestProvider = action.payload;
    },
  },
});

export const { setBestProvider } = tdexSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const seletctBestProvider = (state: RootState) => state.tdex.bestProvider;

export default tdexSlice.reducer;
