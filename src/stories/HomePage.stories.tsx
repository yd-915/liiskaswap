import { Story } from '@storybook/react/types-6-0';
import React from 'react';
import HomePage from '../pages/home';
import { storybookStore } from './storybook.store';

export default {
  title: 'Homepage',
  component: HomePage,
  decorators: [storybookStore],
};

const Template: Story = () => <HomePage />;

export const Default = Template.bind({});
Default.parameters = {
  layout: 'fullscreen',
};
