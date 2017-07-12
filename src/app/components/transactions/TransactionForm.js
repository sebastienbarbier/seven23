import React, {Component} from 'react';
import moment from 'moment';

import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import CircularProgress from 'material-ui/CircularProgress';
import {green500, red500} from 'material-ui/styles/colors';
import Dialog from 'material-ui/Dialog';

import UserStore from '../../stores/UserStore';
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
  actions: {
    textAlign: 'right',
  },
  debit: {
    borderColor: red500,
    color: red500,
  },
  credit: {
    borderColor: green500,
    color: green500,
  },
  loading: {
    textAlign: 'center',
    padding: '50px 0',
  },
};

class TransactionForm extends Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      transaction: null,
      name: null,
      debit: null,
      credit: null,
      amount: null,
      currency: null,
      date: null,
      category: null,
      categories: null,
      currencies: CurrencyStore.currenciesArray,
      indexedCurrency: CurrencyStore.getIndexedCurrencies(),
      loading: false,
      open: false,
      error: {}, // error messages in form from WS
    };

    this.actions = [
      <FlatButton
      label="Cancel"
      primary={true}
      onTouchTap={this.handleCloseTransaction}
      tabIndex={8}
    />,
      <FlatButton
      label="Submit"
      primary={true}
      onTouchTap={this.save}
      tabIndex={7}
    />,
    ];
  }

  componentWillMount() {
    CategoryStore.addChangeListener(this.updateCategories);
  }

  componentDidMount() {
    CategoryActions.read();
  }

  componentWillUnmount() {
    CategoryStore.removeChangeListener(this.updateCategories);
  }

  updateCategories = (categories) => {
    if (categories && Array.isArray(categories)) {
      this.setState({
        categories: categories,
      });
    }
  };

  componentWillReceiveProps(nextProps) {
    let transactionObject = nextProps.transaction;
    if (!transactionObject) {
      transactionObject = {};
    }
    this.setState({
      transaction: transactionObject,
      id: transactionObject.id,
      name: transactionObject.name,
      debit: transactionObject.originalAmount <= 0 ? transactionObject.originalAmount*-1 : null,
      credit: transactionObject.originalAmount > 0 ? transactionObject.originalAmount : null,
      amount: transactionObject.originalAmount,
      currency: transactionObject.originalCurrency ? transactionObject.originalCurrency : CurrencyStore.getSelectedCurrency(),
      date: transactionObject.date ? moment(transactionObject.date, 'YYYY-MM-DD').toDate() : new Date(),
      category: transactionObject.category,
      open: nextProps.open,
      loading: false,
      error: {}, // error messages in form from WS
    });
  }

  handleCloseTransaction = () => {
    this.setState({
      open: false,
    });
  };

  handleNameChange = (event) => {
    this.setState({
      name: event.target.value,
    });
  };

  handleDebitChange = (event) => {
    this.setState({
      debit: event.target.value.replace(',', '.'),
      credit: null,
    });
  };

  handleCreditChange = (event) => {
    this.setState({
      credit: event.target.value.replace(',', '.'),
      debit: null,
    });
  };

  handleSelectColor = (color) => {
    this.setState({
      color: color.target.value,
      colorPicker: false,
    });
  };

  handleCategoryChange = (category) => {
    this.setState({
      category: category ? category.id : null,
    });
  };

  handleCurrencyChange = (currency) => {
    this.setState({
      currency: currency ? currency.id : null,
    });
  };

  handleDateChange = (event, date) => {
    this.setState({
      date: date,
    });
  };

  handleSubmit = () => {
    this.setState({
      open: false,
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
      date: moment(this.state.date).format('YYYY-MM-DD'),
      local_amount: this.state.credit ? this.state.credit : this.state.debit * -1,
      local_currency: this.state.currency,
      category: this.state.category,
    };

    if (transaction.id) {
      TransactionStore.onceUpdateListener((args) => {
        if (args) {
          if (args.id) {
            component.handleSubmit();
          } else {
            component.setState({
              error: args,
              loading: false,
            });
          }
        } else {
          component.handleSubmit();
        }
      });
      TransactionActions.update(transaction);
    } else {
      TransactionStore.onceAddListener((args) => {
        if (args) {
          if (args.id) {
            component.handleSubmit();
          } else {
            component.setState({
              error: args,
              loading: false,
            });
          }
        } else {
          component.handleSubmit();
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
    <Dialog
        title={this.state.transaction && this.state.transaction.id ? 'Edit transaction' : 'New transaction'}
        actions={this.actions}
        modal={false}
        open={this.state.open}
        onRequestClose={this.handleCloseTransaction}
        autoScrollBodyContent={true}
      >
      {
        this.state.loading || !this.state.categories ?
        <div style={styles.loading}>
          <CircularProgress />
        </div>
        :
        <form onSubmit={this.save}>
          <TextField
            floatingLabelText="Name"
            onChange={this.handleNameChange}
            defaultValue={this.state.name}
            errorText={this.state.error.name}
            style={{width: '100%'}}
            tabIndex={1}
            autoFocus={true}
          /><br />
          <TextField
            floatingLabelText="Credit"
            onChange={this.handleCreditChange}
            defaultValue={this.state.credit}
            style={{width: '50%'}}
            underlineStyle={styles.credit}
            floatingLabelStyle={styles.credit}
            floatingLabelFocusStyle={styles.credit}
            underlineFocusStyle={styles.credit}
            errorText={this.state.error.local_amount}
            tabIndex={2}
          /><TextField
            floatingLabelText="Debit"
            onChange={this.handleDebitChange}
            defaultValue={this.state.debit}
            style={{width: '50%'}}
            underlineStyle={styles.debit}
            floatingLabelStyle={styles.debit}
            floatingLabelFocusStyle={styles.debit}
            underlineFocusStyle={styles.debit}
            errorText={this.state.error.local_amount}
            tabIndex={3}
          /><br />
          <DateFieldWithButtons
            floatingLabelText="Date"
            value={this.state.date}
            onChange={this.handleDateChange}
            errorText={this.state.error.date}
            style={{width: '100%'}}
            fullWidth={true}
            autoOk={true}
            tabIndex={4}
          /><br/>
          <AutoCompleteSelectField
            value={this.state.indexedCurrency[this.state.currency]}
            values={this.state.currencies}
            errorText={this.state.error.local_currency}
            onChange={this.handleCurrencyChange}
            floatingLabelText="Currency"
            maxHeight={400}
            fullWidth={true}
            style={{textAlign: 'left'}}
            tabIndex={5}
          /><br />
          <AutoCompleteSelectField
            value={this.state.categories.find((category) => { return category.id === this.state.category })}
            values={this.state.categories}
            errorText={this.state.error.category}
            onChange={this.handleCategoryChange}
            floatingLabelText="Category"
            maxHeight={400}
            fullWidth={true}
            style={{textAlign: 'left'}}
            tabIndex={6}
          >
          </AutoCompleteSelectField><br />
        </form>
      }
    </Dialog>
    );
  }
}

// Inject router in context
TransactionForm.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default TransactionForm;
