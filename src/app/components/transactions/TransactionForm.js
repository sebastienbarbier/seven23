/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
 import React, {Component} from 'react';
 import { Router, Route, Link, browserHistory } from 'react-router';
 import {List, ListItem, makeSelectable} from 'material-ui/List';
 import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
 import FontIcon from 'material-ui/FontIcon';
 import FlatButton from 'material-ui/FlatButton';
 import TextField from 'material-ui/TextField';
 import MaterialColorPicker from 'react-material-color-picker';
 import IconButton from 'material-ui/IconButton';
 import ImageColorize from 'material-ui/svg-icons/image/colorize';
 import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';

 import CircularProgress from 'material-ui/CircularProgress';
 import SelectField from 'material-ui/SelectField';
 import MenuItem from 'material-ui/MenuItem';

 import {green500, red500} from 'material-ui/styles/colors';

 import Dialog from 'material-ui/Dialog';

 import DatePicker from 'material-ui/DatePicker';
 import moment from 'moment';

 import UserStore from '../../stores/UserStore';
 import TransactionStore from '../../stores/TransactionStore';
 import CategoryStore from '../../stores/CategoryStore';
 import CurrencyStore from '../../stores/CurrencyStore';
 import AccountStore from '../../stores/AccountStore';
 import CategoryActions from '../../actions/CategoryActions';
 import TransactionActions from '../../actions/TransactionActions';

 import TransactionModel from '../../models/Transaction';

 const styles = {
  form: {
    textAlign: 'center',
    padding: '0 60px',
  },
  loading: {
    textAlign: 'center',
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

 const dataSourceConfig = {
    text: 'name',
    value: 'id',
  };

 class TransactionForm extends Component {

  constructor(props, context) {
    super(props, context);
    // Set default values
    this.state = {
      transaction: null,
      name: null,
      debit: null,
      credit: null,
      amount: null,
      currency: null,
      date: null,
      category: null,
      categories: Object.values(CategoryStore.getIndexedCategories()).sort((a, b) => {
            return a.name.toLowerCase() > b.name.toLowerCase();
      }),
      indexedCategories: CategoryStore.getIndexedCategories(),
      currencies: CurrencyStore.getAllCurrencies(),
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
      />,
      <FlatButton
        label="Submit"
        primary={true}
        onTouchTap={this.save}
      />,
    ];
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
      debit: event.target.value,
      credit: null,
    });
  };

  handleCreditChange = (event) => {
    this.setState({
      credit: event.target.value,
      debit: null,
    });
  };

  handleSelectColor = (color) => {
    this.setState({
      color: color.target.value,
      colorPicker: false,
    });
  };

  handleCategoryChange = (event, key, payload) => {
    this.setState({
      category: payload.id,
    });
  };

  handleCurrencyChange = (event, key, payload) => {
    this.setState({
      currency: payload.id,
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

    let transaction = new TransactionModel({
      id: this.state.id,
      user: UserStore.getUserId(),
      account: AccountStore.selectedAccount().id,
      name: this.state.name,
      date: moment(this.state.date).format('YYYY-MM-DD'),
      local_amount: this.state.credit ? this.state.credit : this.state.debit * -1,
      local_currency: this.state.currency,
      category: this.state.category,
    });

    if (transaction.id) {
      TransactionStore.onceUpdateListener((args) => {
        if (args) {
          if (args instanceof TransactionModel) {
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
      TransactionActions.update(this.state.transaction, transaction);
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

  componentWillReceiveProps(nextProps) {
    let transactionObject = nextProps.transaction;
    if (!transactionObject) {
      transactionObject = new TransactionModel({});
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
          this.state.loading ?
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
              style={{width: "100%"}}
            /><br />
            <TextField
              floatingLabelText="Credit"
              onChange={this.handleCreditChange}
              defaultValue={this.state.credit}
              style={{width: "50%"}}
              underlineStyle={styles.credit}
              floatingLabelStyle={styles.credit}
              floatingLabelFocusStyle={styles.credit}
              underlineFocusStyle={styles.credit}
              errorText={this.state.error.local_amount}
            /><TextField
              floatingLabelText="Debit"
              onChange={this.handleDebitChange}
              defaultValue={this.state.debit}
              style={{width: "50%"}}
              underlineStyle={styles.debit}
              floatingLabelStyle={styles.debit}
              floatingLabelFocusStyle={styles.debit}
              underlineFocusStyle={styles.debit}
              errorText={this.state.error.local_amount}
            /><br />
            <DatePicker
              floatingLabelText="Date"
              value={this.state.date}
              onChange={this.handleDateChange}
              errorText={this.state.error.date}
              style={{width: "100%"}}
              fullWidth={true}
              autoOk={true}
            /><br />
            <SelectField
              value={this.state.indexedCurrency[this.state.currency]}
              errorText={this.state.error.currency}
              onChange={this.handleCurrencyChange}
              floatingLabelText="Currency"
              maxHeight={400}
              fullWidth={true}
              style={{textAlign: 'left'}}
            >
              { this.state.currencies.map((currency) => {
                return <MenuItem value={currency} key={currency.id} primaryText={currency.name} />
              })}
            </SelectField><br />
            <SelectField
              value={this.state.indexedCategories[this.state.category]}
              errorText={this.state.error.category}
              onChange={this.handleCategoryChange}
              floatingLabelText="Category"
              maxHeight={400}
              fullWidth={true}
              style={{textAlign: 'left'}}
            >
              { this.state.categories.map((category) => {
                return <MenuItem value={category} key={category.id} primaryText={category.name} />
              })}
            </SelectField><br />
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
