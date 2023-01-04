import { Story } from '@storybook/react/types-6-0';
import React from 'react';
import Background, { BackgroundProps } from '../components/Background';

export default {
  title: 'Background',
  component: Background,
};

const Template: Story<BackgroundProps> = (args: BackgroundProps) => (
  <Background {...args}></Background>
);

export const Default = Template.bind({});
Default.parameters = {
  layout: 'fullscreen',
};
