import jazzicon from '@metamask/jazzicon';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

const Identicon = props => {
  const [appended, setAppended] = useState(false);

  return (
    <div
      id={'jazzicon'}
      ref={ref => {
        if (!appended && ref !== null) {
          ref.appendChild(
            jazzicon(40, parseInt(props.account.slice(2, 10), 16)),
          );

          setAppended(true);
        }
      }}
    />
  );
};

Identicon.propTypes = {
  account: PropTypes.string.isRequired,
};

export default Identicon;
