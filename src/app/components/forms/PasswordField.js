import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

// Import for Password field
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Visibility from '@mui/icons-material/Visibility';

export default function PasswordField({
  label,
  value,
  error,
  helperText,
  onChange,
  margin,
  inputProps,
  fullWidth,
  disabled,
}) {

  const uuid = uuidv4();
  
  const [values, setValues] = useState({
    showPassword: false,
  });

  const handleChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  const handleClickShowPassword = () => {
    setValues({
      ...values,
      showPassword: !values.showPassword,
    });
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <FormControl sx={{ width: '100%', marginTop: 2, marginBottom: 1 }} variant="outlined">
      <InputLabel error={error} htmlFor={uuid}>{ label }</InputLabel>
      <OutlinedInput
        id={uuid}
        type={values.showPassword ? 'text' : 'password'}
        value={value}
        label={label}
        onChange={onChange}
        error={error}
        disabled={disabled}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={handleClickShowPassword}
              onMouseDown={handleMouseDownPassword}
              edge="end"
            >
              {values.showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        }
      />
      <FormHelperText 
        error={error}>{helperText}</FormHelperText>
    </FormControl>
  );
}
