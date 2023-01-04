import CssBaseline from '@material-ui/core/CssBaseline';
import { createMuiTheme, Theme } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { NetworkProvider } from '../../context/NetworkContext';
import { UtilsProvider } from '../../context/UtilsContext';
import HomePage from '../../pages/home';
import { store } from '../../store';
import { theme } from './theme';

const history = createBrowserHistory();

function App() {
  return (
    <ThemeProvider theme={createMuiTheme(theme as unknown as Theme)}>
      <CssBaseline />
      <NetworkProvider>
        <UtilsProvider>
          <Provider store={store}>
            <Router history={history}>
              <HomePage />
            </Router>
          </Provider>
        </UtilsProvider>
      </NetworkProvider>
    </ThemeProvider>
  );
}

export default App;
