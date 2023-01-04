import React from 'react';
import currencyIcons from '../assets/images/currencies';

const getCurrencyLabel = (text, icon) => {
  return (
    <>
      <span className='label-icon'>
        <img
          style={{ width: '2rem', marginRight: '0.5rem' }}
          src={currencyIcons[icon]}
          alt={text}
        />
      </span>
      <span>{text}</span>
    </>
  );
};

export default getCurrencyLabel;
