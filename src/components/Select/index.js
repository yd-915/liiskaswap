import { Box, MenuItem, TextField } from '@material-ui/core';
import React from 'react';

const SelectComponent = props => {
  const {
    options,
    variant,
    defaultValue,
    onChange,
    value,
    disabled,
    disableUnderline,
    className,
  } = props;
  const [option, setOption] = React.useState(
    value.id || defaultValue.id || options[0].id,
  );

  React.useEffect(() => {
    if (value.id !== option) {
      setOption(value.id);
    }
  }, [option, value]);

  const handleChange = event => {
    const value = event.target.value;
    const selectedOption = options.filter(option => option.id === value)[0];
    setOption(value);
    onChange(selectedOption);
  };

  return (
    <Box>
      <TextField
        select
        InputProps={{
          disableUnderline,
        }}
        className={className}
        value={option}
        onChange={handleChange}
        variant={variant}
        disabled={disabled}
        SelectProps={{ MenuProps: { disableScrollLock: true } }}
      >
        {options.map(option => (
          <MenuItem key={option.id} value={option.id}>
            {option.label || option.id}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
};

export default SelectComponent;
