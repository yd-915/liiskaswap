import { Story } from '@storybook/react/types-6-0';
import React from 'react';
import PoweredBy, { Props } from '../components/PoweredBy';
import { SwapProvider as Provider } from '../constants/swap';

export default {
  title: 'PoweredBy',
  component: PoweredBy,
  argTypes: {
    provider: { defaultValue: Provider.BOLTZ },
  },
  parameters: {
    layout: 'padded',
  },
};

const Template: Story<Props> = (args: Props) => (
  <PoweredBy {...args} />
);

export const Default = Template.bind({});
