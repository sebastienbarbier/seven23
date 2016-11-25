import React, {Component} from 'react';
import moment from 'moment';

import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import CircularProgress from 'material-ui/CircularProgress';
import {green500, red500} from 'material-ui/styles/colors';
import Dialog from 'material-ui/Dialog';

import UserStore from '../../stores/UserStore';
import ChangeStore from '../../stores/ChangeStore';
import CategoryStore from '../../stores/CategoryStore';
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

class ChangeForm extends Component {

  constructor(props, context) {
    super(props, context);
    // Set default values
    this.state = {
      change: null,
      id: null,
      name: null,
      date: null,
      local_amount: null,
      local_currency: null,
      new_amount: null,
      new_currency: null,
      category: null,
      categories: Object.values(CategoryStore.getIndexedCategories()).sort((a, b) => {
        return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
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
        tabIndex={7}
      />,
      <FlatButton
        label="Submit"
        primary={true}
        onTouchTap={this.save}
        tabIndex={6}
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
          this.handleSubmit();
        } else {
          component.setState({
            error: args,
            loading: false,
          });
        }
      } else {
        this.handleSubmit();
      }
    });

    change.id ? ChangeActions.update(change) : ChangeActions.create(change);

    if (e) {
      e.preventDefault();
    }
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      transaction: nextProps.change,
      id: nextProps.change.id,
      name: nextProps.change.name,
      date: nextProps.change.date ? moment(nextProps.change.date, 'YYYY-MM-DD').toDate() : new Date(),
      local_amount: nextProps.change.local_amount,
      local_currency: nextProps.change.local_currency ? nextProps.change.local_currency : CurrencyStore.getSelectedCurrency(),
      new_amount: nextProps.change.new_amount,
      new_currency: nextProps.change.new_currency,
      open: nextProps.open,
      loading: false,
      error: {}, // error messages in form from WS
    });
  }

  componentWillMount() {
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  render() {
    return (
      <Dialog
          title={this.state.change && this.state.change.id ? 'Edit change' : 'New change'}
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
              style={{width: '100%'}}
              tabIndex={1}
              autoFocus={true}
            /><br />
            <DateFieldWithButtons
              floatingLabelText="Date"
              value={this.state.date}
              onChange={this.handleDateChange}
              errorText={this.state.error.date}
              style={{width: '100%'}}
              fullWidth={true}
              autoOk={true}
            /><br />
            <TextField
              floatingLabelText="Local amount"
              onChange={this.handleLocalAmountChange}
              defaultValue={this.state.local_amount}
              style={{width: '100%'}}
              errorText={this.state.error.local_amount}
              tabIndex={2}
            /><br />
            <AutoCompleteSelectField
              value={this.state.indexedCurrency[this.state.local_currency]}
              values={this.state.currencies}
              errorText={this.state.error.currency}
              onChange={this.handleLocalCurrencyChange}
              floatingLabelText="Local Currency"
              maxHeight={400}
              fullWidth={true}
              style={{textAlign: 'left'}}
              tabIndex={3}
            >
            </AutoCompleteSelectField><br />
            <TextField
              floatingLabelText="New amount"
              onChange={this.handleNewAmountChange}
              defaultValue={this.state.new_amount}
              style={{width: '100%'}}
              errorText={this.state.error.new_amount}
              tabIndex={4}
            /><br />
            <AutoCompleteSelectField
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
          </form>
        }
      </Dialog>
    );
  }
}

// Inject router in context
ChangeForm.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default ChangeForm;
