import React, { useState, useEffect } from "react";
import moment from "moment";

import Button from "@mui/material/Button";

import { DatePicker } from '@mui/x-date-pickers';

import NavigateBefore from "@mui/icons-material/NavigateBefore";
import NavigateNext from "@mui/icons-material/NavigateNext";
import DateRange from "@mui/icons-material/DateRange";
import TextField from '@mui/material/TextField';

import Stack from '@mui/material/Stack';

const styles = {
  container: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  datefield: {
    flexGrow: 1,
    width: "100%",
  },
  button: {
    minWidth: "120px",
    marginTop: "20px",
    marginLeft: "12px",
  },
};

export default function DateFieldWithButtons({
  label,
  value,
  error,
  format,
  helperText,
  disabled,
  onChange,
  id,
  disableYestedayButton,
}) {
  return (
    <div style={styles.container} className="dateFieldWithButtons">
      <DatePicker
        label={label}
        value={value ? moment(value) : ""}
        onChange={(newValue) => {
          onChange(moment(newValue))
        }}
        disabled={disabled}
        inputFormat={format ? format : "DD/MM/YYYY"}
        renderInput={(params) => {
          const endAdornment = params.InputProps.endAdornment;
          delete params.InputProps;
          return <TextField
            margin="normal"
            helperText={helperText}
            fullWidth
            id={id}
            InputProps={{ endAdornment: <Stack direction='row' spacing={2} alignItems="center">
              { endAdornment.type.render(endAdornment.props) }
              {!disableYestedayButton &&
                <Button
                  disabled={disabled}
                  color='inherit'
                  onClick={() => onChange(moment().subtract(1, "days"))}
                >
                  Yesterday
                </Button>
              }
              </Stack> }}
            {...params} />
        }}
      />
    </div>
  );
}
