import React from 'react';

const DrawerContext = React.createContext({
  closeDrawer: () => {},
});

export default DrawerContext;
