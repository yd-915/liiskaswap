import { TextField, TextFieldProps } from '@material-ui/core';
import React, { ReactElement } from 'react';
import NumberInput from './NumberInput';

type NumberFieldProps = TextFieldProps & {
  decimalScale?: number;
};

const NumberField = (props: NumberFieldProps): ReactElement => {
  const { decimalScale, InputProps, inputProps, ...other } = props;

  return (
    <TextField
      InputProps={{
        inputComponent: NumberInput as any,
        inputProps: { decimalScale: decimalScale, ...inputProps },
        ...InputProps,
      }}
      {...other}
    />
  );
};

export default NumberField;
