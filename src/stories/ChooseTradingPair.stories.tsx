import { Story } from '@storybook/react/types-6-0';
import React from 'react';
import ChooseTradingPair, { ChooseTradingPairProps } from '../components/ChooseTradingPair';
import { storybookStore } from './storybook.store';

export default {
  title: 'Choose Trading Pair',
  component: ChooseTradingPair,
  argTypes: {},
  decorators: [storybookStore],
};

const Template: Story<ChooseTradingPairProps> = (
  args: ChooseTradingPairProps,
) => <ChooseTradingPair {...args} />;

export const Default = Template.bind({});
Default.parameters = {
  layout: 'centered',
};
