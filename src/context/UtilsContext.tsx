import is from 'is_js';
import React from 'react';

type Utils = {
  isMobileView?: boolean;
};

export const UtilsContext = React.createContext<Utils | null>(null);

export const UtilsProvider = ({ children }) => {
  const isMobileView = is.mobile();

  return (
    <UtilsContext.Provider value={{ isMobileView }}>
      <>{children}</>
    </UtilsContext.Provider>
  );
};
