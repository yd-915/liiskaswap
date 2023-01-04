import propTypes from 'prop-types';
import React from 'react';
import svgIcons from '../../utils/svgIcons';

const OvalShape = props => {
  const { top, bottom, left, right, className } = props;
  const defaultVal = 'auto';

  const style = {
    top: top || defaultVal,
    bottom: bottom || defaultVal,
    right: right || defaultVal,
    left: left || defaultVal,
  };

  return (
    <img
      className={`oval-shape animate ${className}`}
      src={svgIcons.oval}
      style={style}
      alt=''
    />
  );
};

OvalShape.propTypes = {
  top: propTypes.string,
  bottom: propTypes.string,
  left: propTypes.string,
  right: propTypes.string,
  className: propTypes.string,
};

export default OvalShape;
