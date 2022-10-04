import React, { useState, useEffect } from "react";
import moment from "moment";

import Button from "@mui/material/Button";

import DatePicker from '@mui/lab/DatePicker';

import NavigateBefore from "@mui/icons-material/NavigateBefore";
import NavigateNext from "@mui/icons-material/NavigateNext";
import DateRange from "@mui/icons-material/DateRange";
import TextField from '@mui/material/TextField';

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
  disableYestedayButton,
}) {
  return (
    <div style={styles.container}>
      <DatePicker
        label={label}
        value={value ? moment(value) : ""}
        onChange={(newValue) => {
          onChange(moment(newValue))
        }}
        disabled={disabled}
        inputFormat={format ? format : "DD/MM/YYYY"}
        renderInput={(params) => <TextField
          variant="standard"
          margin="normal"
          helperText={helperText}
          fullWidth
          {...params} />
        }
      />

      {!disableYestedayButton ? (
        <Button
          style={styles.button}
          disabled={disabled}
          color='inherit'
          onClick={() => onChange(moment().subtract(1, "days"))}
        >
          Yesterday
        </Button>
      ) : (
        ""
      )}
    </div>
  );
}


/*<DatePicker
  label={label}
  value={value ? moment(value) : ""}
  disabled={disabled}
  style={styles.datefield}
  margin="normal"
  variant="standard"
  autoOk={true}
  format={format ? format : "DD/MM/YYYY"}
  placeholder={moment().format("DD/MM/YYYY")}
  // mask={value => (value ? [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/] : [])}
  error={error}
  KeyboardButtonProps={{
    "aria-label": "change date",
  }}
  helperText={helperText}
  onChange={(date) => onChange(moment(date))}
  animateYearScrolling={false}
  keyboardIcon={<DateRange />}
  rightArrowIcon={<NavigateNext />}
  leftArrowIcon={<NavigateBefore />}
/>*/