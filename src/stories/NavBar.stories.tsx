import { Story } from '@storybook/react/types-6-0';
import React from 'react';
import NavBar, { NavBarProps } from '../components/NavBar';

export default {
  title: 'Navigation Bar',
  component: NavBar,
  argTypes: {
    // network: { defaultValue: 'mainnet' },
  },
};

const Template: Story<NavBarProps> = (args: NavBarProps) => (
  <NavBar {...args} />
);

export const Default = Template.bind({});
Default.parameters = {
  layout: 'fullscreen',
};
