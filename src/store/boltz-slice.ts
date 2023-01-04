import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FundTransferType, fundTransferTypes } from '../constants/currency';
import { RootState } from './index';

interface BoltzState {
  unit: SelectedFundTransferType;
  ethereumData: any;
}

type SelectedFundTransferType = {
  [key: string]: FundTransferType;
};

const defaultUnitValues = Object.fromEntries(
  Object.entries(fundTransferTypes).map(([key, val]) => [
    key,
    val.find(val => val.value === '2'),
  ]),
);

export const initialState: BoltzState = {
  unit: {
    ...defaultUnitValues,
    ...JSON.parse(localStorage.getItem('boltzUnits') || '{}'),
  },
  ethereumData: undefined,
};

export const swapsSlice = createSlice({
  name: 'boltz',
  initialState,
  reducers: {
    setUnit: (state, action: PayloadAction<SelectedFundTransferType>) => {
      state.unit = { ...state.unit, ...action.payload };
      localStorage.setItem('boltzUnits', JSON.stringify(state.unit));
    },
    setEthereumData: (state, action: PayloadAction<any>) => {
      state.ethereumData = action.payload;
    },
  },
});

export const { setUnit, setEthereumData } = swapsSlice.actions;

export const selectUnit = (state: RootState) => state.boltz.unit;
export const selectEthereumData = (state: RootState) => state.boltz.ethereumData;

export default swapsSlice.reducer;
