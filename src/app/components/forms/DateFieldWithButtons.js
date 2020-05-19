import React, { useState, useEffect } from "react";
import moment from "moment";

import Button from "@material-ui/core/Button";

import { KeyboardDatePicker } from "@material-ui/pickers";

import NavigateBefore from "@material-ui/icons/NavigateBefore";
import NavigateNext from "@material-ui/icons/NavigateNext";
import DateRange from "@material-ui/icons/DateRange";

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
  console.log({
    label,
    value,
    error,
    format,
    helperText,
    disabled,
    onChange,
    disableYestedayButton,
  });
  console.log(moment().format("DD/MM/YYYY"));
  return (
    <div style={styles.container}>
      <KeyboardDatePicker
        label={label}
        value={value ? moment(value) : ""}
        disabled={disabled}
        style={styles.datefield}
        margin="normal"
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
      />

      {!disableYestedayButton ? (
        <Button
          style={styles.button}
          disabled={disabled}
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
