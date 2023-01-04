import { Story } from '@storybook/react/types-6-0';
import React from 'react';
import { OpendexLogoProps } from '../components/Logo';
import Logo from "../../assets/images/swap.png"
export default {
  title: 'Logo',
  component: Logo,
};


const Template: Story<OpendexLogoProps> = (args: OpendexLogoProps) => (
  <img src={Logo} alt="" {...args} />
);

export const Opendex = Template.bind({});
