import { action } from '@storybook/addon-actions';
import React from 'react';
import { Provider } from 'react-redux';

const store = {
  getState: () => {
    return {
      swaps: {
        sendAmount: '0.01',
        receiveAmount: '0.002',
        rates: {},
      },
    };
  },
  subscribe: () => 0,
  dispatch: action('dispatch'),
};

export const storybookStore = story => (
  // @ts-ignore
  <Provider store={store}>{story()}</Provider>
);
