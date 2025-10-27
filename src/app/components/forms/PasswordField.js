import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

// Import for Password field
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";

export default function PasswordField({
  label,
  value,
  error,
  helperText,
  onChange,
  id,
  disabled,
}) {
  const uuid = uuidv4();

  const [values, setValues] = useState({
    showPassword: false,
  });

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
    <FormControl
      sx={{ width: "100%", marginTop: 2, marginBottom: 1 }}
      variant="outlined"
    >
      <InputLabel disabled={disabled} error={error} htmlFor={id || uuid}>
        {label}
      </InputLabel>
      <OutlinedInput
        id={id || uuid}
        type={values.showPassword ? "text" : "password"}
        value={value}
        label={label}
        onChange={onChange}
        error={error}
        disabled={disabled}
        sx={{ paddingRight: 1 }}
        endAdornment={
          <InputAdornment position="end">
            <Button
              aria-label="toggle password visibility"
              sx={{ minWidth: "auto" }}
              onClick={handleClickShowPassword}
              onMouseDown={handleMouseDownPassword}
              edge="end"
              color="inherit"
              tabIndex={-1}
            >
              {values.showPassword ? (
                <VisibilityOff color="action" />
              ) : (
                <Visibility color="action" />
              )}
            </Button>
          </InputAdornment>
        }
      />
      <FormHelperText disabled={disabled} error={error}>
        {helperText}
      </FormHelperText>
    </FormControl>
  );
}
