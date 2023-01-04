import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';
import SwapButton, { SwapButtonProps } from '../components/SwapButton';

export default {
  title: 'Swap Button',
  component: SwapButton,
  argTypes: {
    onClick: { defaultValue: () => {} },
  },
} as Meta;

const Template: Story<SwapButtonProps> = (args: SwapButtonProps) => (
  <SwapButton {...args} />
);

export const Default = Template.bind({});
