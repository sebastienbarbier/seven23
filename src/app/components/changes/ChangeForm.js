import React, {Component} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import {green500, red500} from 'material-ui/styles/colors';
import LinearProgress from 'material-ui/LinearProgress';

import UserStore from '../../stores/UserStore';
import ChangeStore from '../../stores/ChangeStore';
import CurrencyStore from '../../stores/CurrencyStore';
import AccountStore from '../../stores/AccountStore';
import ChangeActions from '../../actions/ChangeActions';
import AutoCompleteSelectField from '../forms/AutoCompleteSelectField';
import DateFieldWithButtons from '../forms/DateFieldWithButtons';

const styles = {
  form: {
    textAlign: 'center',
    padding: '0 60px',
  },
  debit: {
    borderColor: red500,
    color: red500,
  },
  credit: {
    borderColor: green500,
    color: green500,
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '10px 0'
  }
};

class ChangeForm extends Component {

  constructor(props, context) {
    super(props, context);
    // Set default values
    this.state = {
      change: props.change,
      id: props.change ? props.change.id : null,
      name: props.change ? props.change.name : '',
      date: props.change && props.change.date ? moment(props.change.date, 'YYYY-MM-DD').toDate() : new Date(),
      local_amount: props.change ? props.change.local_amount : '',
      local_currency: props.change && props.change.local_currency ? props.change.local_currency : CurrencyStore.getSelectedCurrency(),
      new_amount: props.change ? props.change.new_amount : '',
      new_currency: props.change ? props.change.new_currency : null,
      currencies: CurrencyStore.getAllCurrencies(),
      indexedCurrency: CurrencyStore.getIndexedCurrencies(),
      onSubmit: props.onSubmit,
      onClose: props.onClose,
      loading: false,
      open: false,
      error: {}, // error messages in form from WS
    };

  }

  handleNameChange = (event) => {
    this.setState({
      name: event.target.value,
    });
  };

  handleLocalAmountChange = (event) => {
    this.setState({
      local_amount: event.target.value,
    });
  };

  handleNewAmountChange = (event) => {
    this.setState({
      new_amount: event.target.value,
    });
  };

  handleLocalCurrencyChange = (payload) => {
    this.setState({
      local_currency: payload ? payload.id : null,
    });
  };

  handleNewCurrencyChange = (payload) => {
    this.setState({
      new_currency: payload ? payload.id : null,
    });
  };

  handleDateChange = (event, date) => {
    this.setState({
      date: date,
    });
  };


  save = (e) => {

    let component = this;

    component.setState({
      error: {},
      loading: true,
    });

    let change = {
      id: this.state.id,
      user: UserStore.getUserId(),
      account: AccountStore.selectedAccount().id,
      name: this.state.name,
      date: moment(this.state.date).format('YYYY-MM-DD'),
      new_amount: this.state.new_amount,
      new_currency: this.state.new_currency,
      local_amount: this.state.local_amount,
      local_currency: this.state.local_currency,
    };

    ChangeStore.onceChangeListener((args) => {

      if (args) {
        if (args.id) {
          this.state.onSubmit();
        } else {
          component.setState({
            error: args,
            loading: false,
          });
        }
      } else {
        this.state.onSubmit();
      }
    });

    change.id ? ChangeActions.update(change) : ChangeActions.create(change);

    if (e) {
      e.preventDefault();
    }
  };

  componentWillReceiveProps(nextProps) {
    console.log(nextProps.change);
    this.setState({
      change: nextProps.change,
      id: nextProps.change ? nextProps.change.id : null,
      name: nextProps.change ? nextProps.change.name : '',
      date: nextProps.change && nextProps.change.date ? moment(nextProps.change.date, 'YYYY-MM-DD').toDate() : new Date(),
      local_amount: nextProps.change ? nextProps.change.local_amount : '',
      local_currency: nextProps.change && nextProps.change.local_currency ? nextProps.change.local_currency : CurrencyStore.getSelectedCurrency(),
      new_amount: nextProps.change ? nextProps.change.new_amount : '',
      new_currency: nextProps.change ? nextProps.change.new_currency : null,
      open: nextProps.open,
      loading: false,
      error: {}, // error messages in form from WS
    });
  }

  render() {
    return (
      <div>
        { this.state.loading ?
          <LinearProgress mode="indeterminate" />
          : ''
        }

        <div style={{padding: '16px 28px 8px 28px'}}>
          <form onSubmit={this.save}>
            <TextField
              floatingLabelText="Name"
              disabled={this.state.loading}
              onChange={this.handleNameChange}
              value={this.state.name}
              errorText={this.state.error.name}
              style={{width: '100%'}}
              tabIndex={1}
              autoFocus={true}
            /><br />
            <DateFieldWithButtons
              floatingLabelText="Date"
              disabled={this.state.loading}
              value={this.state.date}
              onChange={this.handleDateChange}
              errorText={this.state.error.date}
              style={{width: '100%'}}
              fullWidth={true}
              autoOk={true}
            /><br />
            <TextField
              floatingLabelText="Local amount"
              disabled={this.state.loading}
              onChange={this.handleLocalAmountChange}
              value={this.state.local_amount}
              style={{width: '100%'}}
              errorText={this.state.error.local_amount}
              tabIndex={2}
            /><br />
            <AutoCompleteSelectField
              floatingLabelText="Local Currency"
              value={this.state.indexedCurrency[this.state.local_currency]}
              disabled={this.state.loading}
              values={this.state.currencies}
              errorText={this.state.error.currency}
              onChange={this.handleLocalCurrencyChange}
              maxHeight={400}
              fullWidth={true}
              style={{textAlign: 'left'}}
              tabIndex={3}
            >
            </AutoCompleteSelectField><br />
            <TextField
              floatingLabelText="New amount"
              disabled={this.state.loading}
              onChange={this.handleNewAmountChange}
              value={this.state.new_amount}
              style={{width: '100%'}}
              errorText={this.state.error.new_amount}
              tabIndex={4}
            /><br />
            <AutoCompleteSelectField
              disabled={this.state.loading}
              value={this.state.indexedCurrency[this.state.new_currency]}
              values={this.state.currencies}
              errorText={this.state.error.currency}
              onChange={this.handleNewCurrencyChange}
              floatingLabelText="New Currency"
              maxHeight={400}
              fullWidth={true}
              style={{textAlign: 'left'}}
              tabIndex={5}
            >
            </AutoCompleteSelectField>
            <div style={styles.actions}>
              <FlatButton
                label="Cancel"
                onTouchTap={this.state.onClose}
                tabIndex={7}
              />
              <FlatButton
                label="Submit"
                primary={true}
                onTouchTap={this.save}
                tabIndex={6}
              />
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default ChangeForm;
