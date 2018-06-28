import React, { Component } from 'react';

import TextField from '@material-ui/core/TextField';

import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';

import FormControlLabel from '@material-ui/core/FormControlLabel';

import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';

import TransactionStore from '../../stores/TransactionStore';
import CurrencyStore from '../../stores/CurrencyStore';
import AccountStore from '../../stores/AccountStore';
import TransactionActions from '../../actions/TransactionActions';
import AutoCompleteSelectField from '../forms/AutoCompleteSelectField';
import DateFieldWithButtons from '../forms/DateFieldWithButtons';

const styles = {
  form: {
    textAlign: 'center',
    padding: '0 60px',
  },
  radioGroup: {
    display: 'flex',
    width: '100%',
    flexDirection: 'row',
    paddingTop: '20px',
  },
  radioButton: {
    flex: '50%',
    width: '50%',
    marginRight: 0,
    paddingLeft: '12px',
  },
  amountIcon: {
    width: '30px',
    height: '30px',
    padding: '34px 14px 0 0',
  },
  amountField: {
    display: 'flex',
    flexDirection: 'row',
  },
};

class TransactionForm extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      transaction: null,
      id: props.transaction && props.transaction.id ? props.transaction.id : '',
      name:
        props.transaction && props.transaction.name
          ? props.transaction.name
          : '',
      amount:
        props.transaction && props.transaction.originalAmount
          ? props.transaction.originalAmount > 0
            ? props.transaction.originalAmount
            : props.transaction.originalAmount * -1
          : '',
      type:
        props.transaction && props.transaction.originalAmount
          ? props.transaction.originalAmount > 0 ? 'income' : 'expense'
          : 'expense',
      currency:
        props.transaction && props.transaction.originalCurrency
          ? props.transaction.originalCurrency
          : CurrencyStore.lastCurrencyUsed,
      date: (props.transaction && props.transaction.date) || new Date(),
      category: props.transaction ? props.transaction.category : null,
      categories: props.categories,
      currencies: CurrencyStore.favoritesArray,
      indexedCurrency: CurrencyStore.getIndexedCurrencies(),
      loading: false,
      openCategory: false,
      onSubmit: props.onSubmit,
      onClose: props.onClose,
      error: {}, // error messages in form from WS
    };
  }

  _createNewCategory = () => {
    this.setState({
      openCategory: true,
    });
  };

  componentWillReceiveProps(nextProps) {
    let transactionObject = nextProps.transaction;
    if (!transactionObject) {
      transactionObject = {};
    }
    this.setState({
      transaction: transactionObject,
      id: transactionObject.id,
      name: transactionObject.name || '',
      amount:
        transactionObject && transactionObject.originalAmount
          ? transactionObject.originalAmount > 0
            ? transactionObject.originalAmount
            : transactionObject.originalAmount * -1
          : '',
      type:
        transactionObject && transactionObject.originalAmount > 0
          ? 'income'
          : 'expense',
      currency:
        transactionObject.originalCurrency || CurrencyStore.lastCurrencyUsed,
      date: transactionObject.date || new Date(),
      category: transactionObject.category,
      categories: nextProps.categories,
      onSubmit: nextProps.onSubmit,
      onClose: nextProps.onClose,
      loading: false,
      error: {}, // error messages in form from WS
    });
  }

  handleNameChange = event => {
    this.setState({
      name: event.target.value,
    });
  };

  handleTypeChange = event => {
    this.setState({
      type: event.target.value,
    });
  };

  handleAmountChange = event => {
    this.setState({
      amount: event.target.value.replace(',', '.'),
    });
  };

  handleCategoryChange = category => {
    this.setState({
      category: category ? category.id : null,
      openCategory: false,
    });
  };

  handleCurrencyChange = currency => {
    this.setState({
      currency: currency ? currency.id : null,
      openCategory: false,
    });
  };

  handleDateChange = (event, date) => {
    this.setState({
      date: date,
      openCategory: false,
    });
  };

  handleSubmit = id => {
    this.setState({
      open: false,
      openCategory: false,
      loading: false,
    });
  };

  save = e => {
    if (e) {
      e.preventDefault();
    }

    let component = this;

    component.setState({
      error: {},
      loading: true,
    });

    let transaction = {
      id: this.state.id,
      account: AccountStore.selectedAccount().id,
      name: this.state.name,
      date: this.state.date,
      local_amount:
        this.state.type === 'income'
          ? this.state.amount
          : this.state.amount * -1,
      local_currency: this.state.currency,
      category: this.state.category,
    };

    CurrencyStore.lastCurrencyUsed = this.state.currency;

    if (transaction.id) {
      TransactionStore.onceUpdateListener(args => {
        if (args) {
          if (args.id) {
            component.state.onSubmit(args.id);
          } else {
            component.setState({
              error: args,
              loading: false,
            });
          }
        } else {
          component.state.onSubmit();
        }
      });
      TransactionActions.update(transaction);
    } else {
      TransactionStore.onceAddListener(args => {
        if (args) {
          if (args.id) {
            component.state.onSubmit();
          } else {
            component.setState({
              error: args,
              loading: false,
            });
          }
        } else {
          component.state.onSubmit();
        }
      });
      TransactionActions.create(transaction);
    }

    if (e) {
      e.preventDefault();
    }
  };

  componentDidMount() {
    setTimeout(() => {
      this.input.focus();
    }, 180);
  }

  render() {
    return (
      <div>
        {this.state.loading || !this.state.categories ? (
          <LinearProgress mode="indeterminate" />
        ) : (
          ''
        )}
        <form onSubmit={this.save} className="content">
          <header>
            <h2 style={{ color: 'white' }}>Transaction</h2>
          </header>
          <div className="form">
            <TextField
              label="Name"
              error={Boolean(this.state.error.name)}
              helperText={this.state.error.name}
              disabled={this.state.loading || !this.state.categories}
              onChange={this.handleNameChange}
              value={this.state.name}
              style={{ width: '100%' }}
              ref={input => {
                this.input = input;
              }}
              autoFocus={true}
              margin="normal"
            />
            <RadioGroup
              aria-label="type"
              name="type"
              value={this.state.type}
              onChange={this.handleTypeChange}
              style={styles.radioGroup}
            >
              <FormControlLabel style={styles.radioButton} value="income" control={<Radio color="primary" />} label="Income" />
              <FormControlLabel style={styles.radioButton} value="expense" control={<Radio color="primary" />} label="Expense" />
            </RadioGroup>
            <div style={styles.amountField}>
              <TextField
                label="Amount"
                type="number"
                disabled={this.state.loading || !this.state.categories}
                onChange={this.handleAmountChange}
                value={this.state.amount}
                error={Boolean(this.state.error.local_amount)}
                helperText={this.state.error.local_amount}
                margin="normal"
              />
              <div style={{ width: '200px' }}>
                <AutoCompleteSelectField
                  label="Currency"
                  disabled={this.state.loading || !this.state.categories}
                  value={this.state.indexedCurrency[this.state.currency]}
                  values={this.state.currencies}
                  error={Boolean(this.state.error.local_currency)}
                  helperText={this.state.error.local_currency}
                  onChange={this.handleCurrencyChange}
                  maxHeight={400}
                  margin="normal"
                />
              </div>
            </div>
            <DateFieldWithButtons
              label="Date"
              disabled={this.state.loading || !this.state.categories}
              value={this.state.date}
              onChange={this.handleDateChange}
              error={Boolean(this.state.error.date)}
              helperText={this.state.error.date}
              style={{ width: '100%' }}
              fullWidth
              autoOk={true}
            />
            <AutoCompleteSelectField
              label="Category"
              disabled={this.state.loading || !this.state.categories}
              value={
                this.state.categories
                  ? this.state.categories.find(category => {
                    return category.id === this.state.category;
                  })
                  : undefined
              }
              values={this.state.categories || []}
              error={Boolean(this.state.error.category)}
              helperText={this.state.error.category}
              onChange={this.handleCategoryChange}
              maxHeight={400}
              fullWidth={true}
              style={{ textAlign: 'left' }}
            />
          </div>
          <footer>
            <Button
              onClick={this.state.onClose}
            >Cancel</Button>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={this.state.loading || !this.state.categories}
              style={{ marginLeft: '8px' }}
            >Submit</Button>
          </footer>
        </form>
      </div>
    );
  }
}

export default TransactionForm;
