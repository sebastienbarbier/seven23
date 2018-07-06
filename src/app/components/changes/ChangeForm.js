import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import moment from 'moment';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import LinearProgress from '@material-ui/core/LinearProgress';

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

    const { selectedCurrency } = this.props;
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
          : selectedCurrency,
      new_amount: props.change ? props.change.new_amount : '',
      new_currency: props.change ? props.change.new_currency : null,
      currencies: props.currencies,
      indexedCurrency: selectedCurrency,
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

  handleDateChange = (date) => {
    this.setState({ date });
  };

  save = e => {
    if (e) { e.preventDefault(); }

    this.setState({
      error: {},
      loading: true,
    });

    const { dispatch, userId, account } = this.props;

    let change = {
      id: this.state.id,
      user: userId,
      account: account.id,
      name: this.state.name,
      date: moment(this.state.date).format('YYYY-MM-DD'),
      new_amount: this.state.new_amount,
      new_currency: this.state.new_currency,
      local_amount: this.state.local_amount,
      local_currency: this.state.local_currency,
    };

    let promise;

    if (change.id) {
      promise = dispatch(ChangeActions.update(change));
    } else {
      promise = dispatch(ChangeActions.create(change));
    }

    promise.then(() => {
      this.state.onSubmit();
    }).catch((error) => {
      if (error) {
        this.setState({
          error: error,
          loading: false,
        });
      }
    });
  };

  componentWillReceiveProps(nextProps) {

    const { selectedCurrency } = nextProps;

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
          : selectedCurrency,
      new_amount: nextProps.change ? nextProps.change.new_amount : '',
      new_currency: nextProps.change ? nextProps.change.new_currency : null,
      currencies: nextProps.currencies,
      loading: false,
      error: {}, // error messages in form from WS
    });
  }

  render() {

    const { currencies } = this.state;

    return (
      <div>
        {this.state.loading ? <LinearProgress mode="indeterminate" /> : ''}

        <form onSubmit={this.save} className="content">
          <header>
            <h2 style={{ color: 'white' }}>Change</h2>
          </header>
          <div className="form">
            <TextField
              fullWidth
              label="Name"
              disabled={this.state.loading}
              onChange={this.handleNameChange}
              value={this.state.name}
              error={Boolean(this.state.error.name)}
              helperText={this.state.error.name}
              margin="normal"
            />
            <br />
            <DateFieldWithButtons
              label="Date"
              disabled={this.state.loading}
              value={this.state.date}
              onChange={this.handleDateChange}
              error={Boolean(this.state.error.date)}
              helperText={this.state.error.date}
              fullWidth
              fullWidth={true}
              autoOk={true}
            />
            <br />
            <div style={styles.amountField}>
              <TextField
                label="Amount"
                disabled={this.state.loading}
                onChange={this.handleLocalAmountChange}
                value={this.state.local_amount}
                fullWidth
                error={Boolean(this.state.error.local_amount)}
                helperText={this.state.error.local_amount}
                margin="normal"
              />

              <div style={{ flex: '100%', flexGrow: 1 }}>
                <AutoCompleteSelectField
                  label="From currency"
                  value={currencies.find(c => c.id === this.state.local_currency)}
                  disabled={this.state.loading}
                  values={currencies}
                  error={Boolean(this.state.error.local_currency)}
                  helperText={this.state.error.local_currency}
                  onChange={this.handleLocalCurrencyChange}
                  maxHeight={400}
                  margin="normal"
                />
              </div>
            </div>
            <div style={styles.amountField}>
              <TextField
                label="Amount"
                disabled={this.state.loading}
                onChange={this.handleNewAmountChange}
                value={this.state.new_amount}
                fullWidth
                error={Boolean(this.state.error.new_amount)}
                helperText={this.state.error.new_amount}
                margin="normal"
              />

              <div style={{ flex: '100%', flexGrow: 1 }}>
                <AutoCompleteSelectField
                  disabled={this.state.loading}
                  value={currencies.find(c => c.id === this.state.new_currency)}
                  values={currencies}
                  error={Boolean(this.state.error.new_currency)}
                  helperText={this.state.error.new_currency}
                  onChange={this.handleNewCurrencyChange}
                  label="To currency"
                  maxHeight={400}
                  margin="normal"
                />
              </div>
            </div>
          </div>

          <footer>
            <Button
              onClick={this.state.onClose}
            >Cancel</Button>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={this.state.loading}
              style={{ marginLeft: '8px' }}
            >Submit</Button>
          </footer>
        </form>
      </div>
    );
  }
}

ChangeForm.propTypes = {
  dispatch: PropTypes.func.isRequired,
  change: PropTypes.object.isRequired,
  currencies: PropTypes.array.isRequired,
  userId: PropTypes.number.isRequired,
  account: PropTypes.object.isRequired,
  selectedCurrency: PropTypes.object.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  console.log(ownProps);
  return {
    currencies: state.currencies.filter((currency) => {
      return state.user.profile.favoritesCurrencies.includes(currency.id) ||
        (ownProps.change && (ownProps.change.new_currency === currency.id ||
        ownProps.change.local_currency === currency.id));
    }),
    userId: state.user.profile.pk,
    account: state.account,
    selectedCurrency: state.currencies.find(c => c.id === state.account.currency),
  };
};

export default connect(mapStateToProps)(ChangeForm);
