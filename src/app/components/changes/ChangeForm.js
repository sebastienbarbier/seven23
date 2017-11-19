import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import { green500, red500 } from 'material-ui/styles/colors';
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
  amountField: {
    display: 'flex',
  },
};

class ChangeForm extends Component {
  constructor(props, context) {
    super(props, context);
    // Set default values
    this.state = {
      change: props.change,
      id: props.change ? props.change.id : null,
      name: props.change ? props.change.name : '',
      date:
        props.change && props.change.date
          ? moment(props.change.date, 'YYYY-MM-DD').toDate()
          : new Date(),
      local_amount: props.change ? props.change.local_amount : '',
      local_currency:
        props.change && props.change.local_currency
          ? props.change.local_currency
          : CurrencyStore.getSelectedCurrency(),
      new_amount: props.change ? props.change.new_amount : '',
      new_currency: props.change ? props.change.new_currency : null,
      currencies: CurrencyStore.getAllCurrencies(),
      indexedCurrency: CurrencyStore.getIndexedCurrencies(),
      onSubmit: props.onSubmit,
      onClose: props.onClose,
      loading: false,
      error: {}, // error messages in form from WS
    };
  }

  handleNameChange = event => {
    this.setState({
      name: event.target.value,
    });
  };

  handleLocalAmountChange = event => {
    this.setState({
      local_amount: event.target.value,
    });
  };

  handleNewAmountChange = event => {
    this.setState({
      new_amount: event.target.value,
    });
  };

  handleLocalCurrencyChange = payload => {
    this.setState({
      local_currency: payload ? payload.id : null,
    });
  };

  handleNewCurrencyChange = payload => {
    this.setState({
      new_currency: payload ? payload.id : null,
    });
  };

  handleDateChange = (event, date) => {
    this.setState({
      date: date,
    });
  };

  save = e => {
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

    ChangeStore.onceChangeListener(args => {
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
    this.setState({
      change: nextProps.change,
      id: nextProps.change ? nextProps.change.id : null,
      name: nextProps.change ? nextProps.change.name : '',
      date:
        nextProps.change && nextProps.change.date
          ? moment(nextProps.change.date, 'YYYY-MM-DD').toDate()
          : new Date(),
      local_amount: nextProps.change ? nextProps.change.local_amount : '',
      local_currency:
        nextProps.change && nextProps.change.local_currency
          ? nextProps.change.local_currency
          : CurrencyStore.getSelectedCurrency(),
      new_amount: nextProps.change ? nextProps.change.new_amount : '',
      new_currency: nextProps.change ? nextProps.change.new_currency : null,
      loading: false,
      error: {}, // error messages in form from WS
    });
  }

  render() {
    return (
      <div>
        {this.state.loading ? <LinearProgress mode="indeterminate" /> : ''}

        <form onSubmit={this.save} className="content">
          <header>
            <h2>Change</h2>
          </header>
          <div className="form">
            <TextField
              floatingLabelText="Name"
              disabled={this.state.loading}
              onChange={this.handleNameChange}
              value={this.state.name}
              errorText={this.state.error.name}
              style={{ width: '100%' }}
              tabIndex={1}
              autoFocus={true}
            />
            <br />
            <DateFieldWithButtons
              floatingLabelText="Date"
              disabled={this.state.loading}
              value={this.state.date}
              onChange={this.handleDateChange}
              errorText={this.state.error.date}
              style={{ width: '100%' }}
              fullWidth={true}
              tabIndex={2}
              autoOk={true}
            />
            <br />
            <div style={styles.amountField}>
              <TextField
                floatingLabelText="Amount"
                disabled={this.state.loading}
                onChange={this.handleLocalAmountChange}
                value={this.state.local_amount}
                style={{ width: '100%' }}
                errorText={this.state.error.local_amount}
                tabIndex={3}
              />

              <div style={{ width: '300px' }}>
                <AutoCompleteSelectField
                  floatingLabelText="From currency"
                  value={this.state.indexedCurrency[this.state.local_currency]}
                  disabled={this.state.loading}
                  values={this.state.currencies}
                  errorText={this.state.error.local_amount}
                  onChange={this.handleLocalCurrencyChange}
                  maxHeight={400}
                  tabIndex={4}
                />
              </div>
            </div>
            <div style={styles.amountField}>
              <TextField
                floatingLabelText="Amount"
                disabled={this.state.loading}
                onChange={this.handleNewAmountChange}
                value={this.state.new_amount}
                style={{ width: '100%' }}
                errorText={this.state.error.new_amount}
                tabIndex={5}
              />

              <div style={{ width: '300px' }}>
                <AutoCompleteSelectField
                  disabled={this.state.loading}
                  value={this.state.indexedCurrency[this.state.new_currency]}
                  values={this.state.currencies}
                  errorText={this.state.error.new_currency}
                  onChange={this.handleNewCurrencyChange}
                  floatingLabelText="To currency"
                  maxHeight={400}
                  tabIndex={6}
                />
              </div>
            </div>
          </div>

          <footer>
            <FlatButton
              label="Cancel"
              onTouchTap={this.state.onClose}
              tabIndex={8}
            />
            <RaisedButton
              label="Submit"
              type="submit"
              primary={true}
              disabled={this.state.loading}
              style={{ marginLeft: '8px' }}
              tabIndex={7}
            />
          </footer>
        </form>
      </div>
    );
  }
}

export default ChangeForm;
