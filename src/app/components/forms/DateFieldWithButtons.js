import React, { Component } from "react";
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
    alignItems: "center"
  },
  datefield: {
    flexGrow: 1,
    width: "100%"
  },
  button: {
    minWidth: "120px",
    marginTop: "20px",
    marginLeft: "12px"
  }
};

class DateFieldWithButtons extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      label: props.label,
      selectedDate: moment(props.value),
      onChange: props.onChange,
      error: props.error,
      format: props.format,
      helperText: props.helperText,
      disableYestedayButton: props.disableYestedayButton,
      autoOk: props.autoOk,
      disabled: props.disabled
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({
      label: nextProps.label,
      selectedDate: moment(nextProps.value),
      onChange: nextProps.onChange,
      error: nextProps.error,
      format: nextProps.format,
      helperText: nextProps.helperText,
      disableYestedayButton: nextProps.disableYestedayButton,
      autoOk: nextProps.autoOk,
      disabled: nextProps.disabled
    });
  }

  handleYesteday = () => {
    this.state.onChange(moment().subtract(1, "days"));
  };

  handleOnChange = date => {
    this.state.onChange(moment(date));
  };

  render() {
    const { selectedDate, disableYestedayButton, format } = this.state;
    return (
      <div style={styles.container}>
        <KeyboardDatePicker
          label={this.state.label}
          value={selectedDate}
          disabled={this.state.disabled}
          style={styles.datefield}
          margin="normal"
          autoOk={true}
          format={format ? format : "DD/MM/YYYY"}
          placeholder={moment().format("DD/MM/YYYY")}
          // mask={value => (value ? [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/] : [])}
          error={this.state.error}
          helperText={this.state.helperText}
          onChange={this.handleOnChange}
          animateYearScrolling={false}
          keyboardIcon={<DateRange />}
          rightArrowIcon={<NavigateNext />}
          leftArrowIcon={<NavigateBefore />}
        />

        {!disableYestedayButton ? (
          <Button
            style={styles.button}
            disabled={this.state.disabled}
            onClick={this.handleYesteday}
          >
            Yesterday
          </Button>
        ) : (
          ""
        )}
      </div>
    );
  }
}

export default DateFieldWithButtons;
