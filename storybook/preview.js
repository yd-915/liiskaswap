import CssBaseline from '@material-ui/core/CssBaseline';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/core';
import { withThemes } from '@react-theming/storybook-addon';
import { addDecorator } from '@storybook/react';
import React from 'react';
import { theme } from '../src/components/App/theme';
import '../src/index.scss';
import storybookTheme from './theme';

const providerFn = ({ theme, children }) => {
  const muTheme = createMuiTheme(theme);
  return (
    <ThemeProvider theme={muTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

addDecorator(withThemes(null, [theme], { providerFn }));

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  docs: {
    theme: storybookTheme,
  },
  layout: 'centered',
};
