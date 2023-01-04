import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';
import Button, { ButtonProps } from '../components/Button';

export default {
  title: 'Button',
  component: Button,
  argTypes: {
    color: { defaultValue: 'default' },
  },
} as Meta;

const Template: Story<ButtonProps> = (args: ButtonProps) => (
  <Button {...args}>Button</Button>
);

export const DefaultText = Template.bind({});

export const PrimaryText = Template.bind({});
PrimaryText.args = {
  color: 'primary',
};

export const DefaultContained = Template.bind({});
DefaultContained.args = {
  variant: 'contained',
};

export const PrimaryContained = Template.bind({});
PrimaryContained.args = {
  color: 'primary',
  variant: 'contained',
};
