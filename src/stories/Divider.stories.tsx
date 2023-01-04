import { Story } from '@storybook/react/types-6-0';
import React from 'react';
import Divider, { DividerProps } from '../components/Divider';

export default {
  title: 'Divider',
  component: Divider,
};

const Template: Story<DividerProps> = (args: DividerProps) => (
  <>
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>Divider</div>
    <Divider {...args} />
  </>
);

export const Default = Template.bind({});
Default.parameters = {
  layout: 'fullscreen',
};
