import React, { Component } from 'react';
import moment from 'moment';

import Button from '@material-ui/core/Button';
import DatePicker from 'material-ui-pickers/DatePicker';

import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';

const styles = {
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  datefield: {
    flexGrow: 1,
    width: '100%',
  },
  button: {
    width: '105px',
    marginTop: '20px',
    marginLeft: '12px',
  },
};

class DateFieldWithButtons extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      label: props.label,
      value: props.value,
      onChange: props.onChange,
      error: props.error,
      helperText: props.helperText,
      autoOk: props.autoOk,
      disabled: props.disabled,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      label: nextProps.label,
      value: nextProps.value,
      onChange: nextProps.onChange,
      error: nextProps.error,
      helperText: nextProps.helperText,
      autoOk: nextProps.autoOk,
      disabled: nextProps.disabled,
    });
  }

  handleYesteday = () => {
    this.state.onChange(
      null,
      moment()
        .subtract(1, 'days')
        .toDate(),
    );
  };

  handleOnChange = (date) => {
    this.state.onChange(
      null,
      date
    );
  }

  render() {
    return (
      <div style={styles.container}>

        <DatePicker
          label={this.state.label}
          value={this.state.value}
          disabled={this.state.disabled}
          defaultValue={new Date()}
          style={styles.datefield}
          margin="normal"
          autoOk={true}
          error={this.state.error}
          helperText={this.state.helperText}
          onChange={this.handleOnChange}
          InputLabelProps={{
            shrink: true,
          }}
          rightArrowIcon={(<NavigateNext />)}
          leftArrowIcon={(<NavigateBefore />)}
        />

        <Button
          style={styles.button}
          disabled={this.state.disabled}
          onClick={this.handleYesteday}
        >Yesterday</Button>
      </div>
    );
  }
}

export default DateFieldWithButtons;
