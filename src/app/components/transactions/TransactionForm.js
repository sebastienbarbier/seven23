import React, {Component} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import {green900, red900} from 'material-ui/styles/colors';
import LinearProgress from 'material-ui/LinearProgress';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';

import AddIcon from 'material-ui/svg-icons/content/add';
import RemoveIcon from 'material-ui/svg-icons/content/remove';

import TransactionStore from '../../stores/TransactionStore';
import CategoryStore from '../../stores/CategoryStore';
import CategoryActions from '../../actions/CategoryActions';
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
    flexDirection: 'row',
    paddingTop: '20px'
  },
  radioButton: {
    flex: '50%',
    paddingLeft: '12px'
  },
  amountIcon: {
    width: '30px',
    height: '30px',
    padding: '34px 14px 0 0'
  },
  amountField: {
    display: 'flex',
    flexDirection: 'row'
  }
};

class TransactionForm extends Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      transaction: null,
      id: props.transaction && props.transaction.id ? props.transaction.id :'',
      name: props.transaction && props.transaction.name ? props.transaction.name :'',
      amount: props.transaction && props.transaction.originalAmount ? (props.transaction.originalAmount > 0 ? props.transaction.originalAmount : props.transaction.originalAmount*-1) : '',
      type: props.transaction && props.transaction.originalAmount ? (props.transaction.originalAmount > 0 ? 'income' : 'expense') : 'expense',
      currency: props.transaction && props.transaction.originalCurrency ? props.transaction.originalCurrency : CurrencyStore.getSelectedCurrency(),
      date: props.transaction && props.transaction.date || new Date(),
      category: props.transaction ? props.transaction.category : null,
      categories: props.categories,
      currencies: CurrencyStore.currenciesArray,
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
      openCategory: true
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
      amount: transactionObject && transactionObject.originalAmount ? (transactionObject.originalAmount > 0 ? transactionObject.originalAmount : transactionObject.originalAmount*-1) : '',
      type: transactionObject && transactionObject.originalAmount > 0 ? 'income' : 'expense',
      currency: transactionObject.originalCurrency || CurrencyStore.getSelectedCurrency(),
      date: transactionObject.date || new Date(),
      category: transactionObject.category,
      categories: nextProps.categories,
      onSubmit: nextProps.onSubmit,
      onClose: nextProps.onClose,
      loading: false,
      error: {}, // error messages in form from WS
    });
  }

  handleNameChange = (event) => {
    this.setState({
      name: event.target.value,
    });
  };

  handleTypeChange = (event) => {
    this.setState({
      type: event.target.value,
    });
  };

  handleAmountChange = (event) => {
    this.setState({
      amount: event.target.value.replace(',', '.')
    });
  };

  handleCategoryChange = (category) => {
    this.setState({
      category: category ? category.id : null,
      openCategory: false
    });
  };

  handleCurrencyChange = (currency) => {
    this.setState({
      currency: currency ? currency.id : null,
      openCategory: false
    });
  };

  handleDateChange = (event, date) => {
    this.setState({
      date: date,
      openCategory: false
    });
  };

  handleSubmit = (id) => {
    this.setState({
      open: false,
      openCategory: false,
      loading: false,
    });
  };

  save = (e) => {

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
      local_amount: this.state.type === 'income' ? this.state.amount : this.state.amount * -1,
      local_currency: this.state.currency,
      category: this.state.category,
    };

    if (transaction.id) {
      TransactionStore.onceUpdateListener((args) => {
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
      TransactionStore.onceAddListener((args) => {
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

  render() {
    return (
      <div>
        { this.state.loading || !this.state.categories ?
          <LinearProgress mode="indeterminate" />
          : ''
        }
        <form onSubmit={this.save} className="content">
          <header>
            <h2>Transaction</h2>
          </header>
          <div className="form">
            <TextField
              floatingLabelText="Name"
              disabled={this.state.loading || !this.state.categories }
              onChange={this.handleNameChange}
              value={this.state.name}
              errorText={this.state.error.name}
              style={{width: '100%'}}
              tabIndex={1}
              autoFocus={true}
            />
            <RadioButtonGroup
              name="type"
              valueSelected={this.state.type}
              defaultSelected={this.state.type}
              onChange={this.handleTypeChange}
              style={styles.radioGroup}>
              <RadioButton
                value="income"
                label="Income"
                tabIndex={2}
                style={styles.radioButton}
              />
              <RadioButton
                value="expense"
                label="Expense"
                tabIndex={3}
                style={styles.radioButton}
              />
            </RadioButtonGroup>
            <div style={styles.amountField}>
              { this.state.type === 'income' ?
                <AddIcon style={styles.amountIcon} color={green900} /> :
                <RemoveIcon style={styles.amountIcon} color={red900} />
              }
              <TextField
                floatingLabelText="Amount"
                disabled={this.state.loading || !this.state.categories }
                onChange={this.handleAmountChange}
                value={this.state.amount}
                errorText={this.state.error.local_amount}
                tabIndex={4}
              />
              <div style={{width: '200px'}}>
                <AutoCompleteSelectField
                  floatingLabelText="Currency"
                  disabled={this.state.loading || !this.state.categories }
                  value={this.state.indexedCurrency[this.state.currency]}
                  values={this.state.currencies}
                  errorText={this.state.error.local_currency}
                  onChange={this.handleCurrencyChange}
                  maxHeight={400}
                  tabIndex={5}
                />
              </div>
            </div>
            <DateFieldWithButtons
              floatingLabelText="Date"
              disabled={this.state.loading || !this.state.categories }
              value={this.state.date}
              onChange={this.handleDateChange}
              errorText={this.state.error.date}
              style={{width: '100%'}}
              fullWidth={true}
              autoOk={true}
              tabIndex={6}
            />
            <AutoCompleteSelectField
              floatingLabelText="Category"
              disabled={this.state.loading || !this.state.categories }
              value={this.state.categories ? this.state.categories.find((category) => { return category.id === this.state.category }) : undefined}
              values={this.state.categories || []}
              errorText={this.state.error.category}
              onChange={this.handleCategoryChange}
              maxHeight={400}
              fullWidth={true}
              style={{textAlign: 'left'}}
              tabIndex={7}
            >
            </AutoCompleteSelectField>
          </div>
          <footer>
            <FlatButton
              label="Cancel"
              onTouchTap={this.state.onClose}
              tabIndex={9} />
            <RaisedButton
              label="Submit"
              type="submit"
              disabled={this.state.loading || !this.state.categories }
              primary={true}
              style={{marginLeft: '8px'}}
              onTouchTap={this.save}
              tabIndex={8} />
          </footer>
        </form>
      </div>
    );
  }
}

export default TransactionForm;
