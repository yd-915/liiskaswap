import React from 'react';
import AssetSelector from '../components/AssetSelector';
import { CurrencyOptions } from '../constants/currency';

export default {
  title: 'AssetSelector',
  component: AssetSelector,
  argTypes: {
    label: { defaultValue: 'You send' },
    value: { defaultValue: undefined },
    selectedAsset: { defaultValue: CurrencyOptions[0] },
    onAmountChange: { defaultValue: () => {} },
    onAssetChange: { defaultValue: () => {} },
    onKeyPress: { defaultValue: () => {} },
    loading: { defaultValue: false },
  },
};

const Template = args => (
  <div style={{ minWidth: '250px' }}>
    <AssetSelector {...args} />
  </div>
);

export const YouSend = Template.bind({});
YouSend.args = {};

export const YouReceive = Template.bind({});
YouReceive.args = {
  label: 'You receive',
  selectedAsset: CurrencyOptions[2],
};

export const Loading = Template.bind({});
Loading.args = {
  loading: true,
};
