import React from 'react';

export const StepsContext = React.createContext(null);

export const StepsProvider = ({ children }) => {
  const [reverseActiveStep, setReverseActiveStep] = React.useState(1);
  const [submarineActiveStep, setSubmarineActiveStep] = React.useState(0);
  const [refundActiveStep, setRefundActiveStep] = React.useState(0);

  return (
    <StepsContext.Provider
      value={{
        reverseActiveStep,
        setReverseActiveStep,
        submarineActiveStep,
        setSubmarineActiveStep,
        refundActiveStep,
        setRefundActiveStep,
      }}
    >
      <>{children}</>
    </StepsContext.Provider>
  );
};
