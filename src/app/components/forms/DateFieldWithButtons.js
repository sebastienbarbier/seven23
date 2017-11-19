import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";

import DatePicker from "material-ui/DatePicker";
import FlatButton from "material-ui/FlatButton";

const styles = {
  container: {
    width: "100%",
  },
  datepicker: {
    marginRight: "110px",
  },
  button: {
    width: "105px",
    float: "right",
    marginTop: "29px",
  },
};

class DateFieldWithButtons extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      floatingLabelText: props.floatingLabelText,
      value: props.value,
      onChange: props.onChange,
      errorText: props.errorText,
      autoOk: props.autoOk,
      disabled: props.disabled,
      tabIndex: props.tabIndex,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      floatingLabelText: nextProps.floatingLabelText,
      value: nextProps.value,
      onChange: nextProps.onChange,
      errorText: nextProps.errorText,
      autoOk: nextProps.autoOk,
      disabled: nextProps.disabled,
      tabIndex: nextProps.tabIndex,
    });
  }

  handleYesteday = () => {
    this.state.onChange(
      null,
      moment()
        .subtract(1, "days")
        .toDate()
    );
  };

  render() {
    return (
      <div style={styles.container}>
        <FlatButton
          label="Yesterday"
          style={styles.button}
          disabled={this.state.disabled}
          tabIndex={this.state.tabIndex}
          onTouchTap={this.handleYesteday}
        />
        <DatePicker
          floatingLabelText={this.state.floatingLabelText}
          value={this.state.value}
          disabled={this.state.disabled}
          onChange={this.state.onChange}
          errorText={this.state.errorText}
          fullWidth={true}
          style={styles.datepicker}
          autoOk={this.state.autoOk}
        />
      </div>
    );
  }
}

export default DateFieldWithButtons;
