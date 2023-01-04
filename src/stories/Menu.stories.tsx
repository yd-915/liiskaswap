import { Story } from '@storybook/react/types-6-0';
import React from 'react';
import Menu, { MenuProps } from '../components/Menu';

export default {
  title: 'Menu',
  component: Menu,
  argTypes: {},
};

const Template: Story<MenuProps> = (args: MenuProps) => <Menu {...args} />;

export const Default = Template.bind({});
