import React from 'react';
import { Route, Switch } from 'react-router-dom';

export const renderRoutes = routes => {
  return (
    <Switch>
      {routes.map((route, i) => {
        const { key, path, exact, strict, component } = route;
        return (
          <Route
            key={key || i}
            path={path}
            exact={exact}
            strict={strict}
            component={component}
          />
        );
      })}
    </Switch>
  );
};
