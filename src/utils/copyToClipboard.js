import React, { useEffect } from 'react';

export default () => {
  const [isCopied, setCopied] = React.useState(false);
  const resetInterval = 20000; // 20 seconds

  const handleCopy = selector => {
    let copyTextarea = document.querySelector(selector);
    copyTextarea.focus();
    copyTextarea.select();
    document.execCommand('copy');
    setCopied(true);
  };

  useEffect(() => {
    let timeout;
    if (isCopied && resetInterval) {
      timeout = setTimeout(() => setCopied(false), resetInterval);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [isCopied, resetInterval]);

  return [isCopied, handleCopy];
};
