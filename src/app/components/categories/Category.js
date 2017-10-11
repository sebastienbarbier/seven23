import React, {Component} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {Card, CardText} from 'material-ui/Card';

import muiThemeable from 'material-ui/styles/muiThemeable';
import CircularProgress from 'material-ui/CircularProgress';


import IconButton from 'material-ui/IconButton';
import NavigateBefore from 'material-ui/svg-icons/image/navigate-before';

import {green500, green600, white} from 'material-ui/styles/colors';

import AccountStore from '../../stores/AccountStore';
import CategoryStore from '../../stores/CategoryStore';
import CategoryActions from '../../actions/CategoryActions';
import CurrencyStore from '../../stores/CurrencyStore';
import TransactionStore from '../../stores/TransactionStore';
import TransactionActions from '../../actions/TransactionActions';

import TransactionTable from '../transactions/TransactionTable';

const styles = {
  loading: {
    textAlign: 'center',
    padding: '50px 0',
  },
  button: {
    float: 'right',
    marginTop: '12px',
  },
  card: {
    width: '400px',
  },
  actions: {
    width: '30px',
  }
};

class Category extends Component {

  constructor(props, context) {
    super(props, context);
    this.history = props.history;
    this.state = {
      category: props.category,
      categories: props.categories,
      onEditTransaction: props.onEditTransaction,
      onDuplicationTransaction: props.onDuplicationTransaction,
      transactions: new Set(),
      stats: {},
      loading: true,
      snackbar: {
        open: false,
        message: ''
      }
    };
    this.context = context;
  }

  updateCategory = (category) => {
    if (category && !Array.isArray(category)) {
      this.setState({
        category: category,
      });
    }
  };

  updateTransaction = () => {
    this.setState({
      loading: true
    });
    TransactionActions.read({
      category: this.state.category.id
    });
  };

  changeTransactions = (args) => {
    if (args && args.transactions && Array.isArray(args.transactions)) {

      this.setState({
        loading: false,
        stats: args.stats,
        transactions: args.transactions,
      });
    }
  };

  updateAccount = (args) => {
    this.setState({
      loading: true
    });
    TransactionActions.read({
      category: this.state.id
    });
  };

  _deleteData = (deletedItem) => {
    let list = this.state.transactions.filter((item) => { return item.id != deletedItem.id });
    this.setState({
      transactions: list,
    });
    this.changeTransactions(list);
  };

  componentWillReceiveProps(nextProps) {

    if (this.state.category.id != nextProps.category.id) {
      TransactionActions.read({
        category: nextProps.category.id
      });

      this.setState({
        category: nextProps.category,
        categories: nextProps.categories,
        onEditTransaction: nextProps.onEditTransaction,
        onDuplicationTransaction: nextProps.onDuplicationTransaction,
        transactions: new Set(),
        stats: {},
        open: false,
        loading: true
      });
    }
  }

  componentWillMount() {
    AccountStore.addChangeListener(this.updateAccount);
    TransactionStore.addChangeListener(this.changeTransactions);
    TransactionStore.addAddListener(this.updateTransaction);
    TransactionStore.addUpdateListener(this.updateTransaction);
    TransactionStore.addDeleteListener(this._deleteData);
  }

  componentDidMount() {
    TransactionActions.read({
      category: this.state.category.id
    });
  }

  componentWillUnmount() {
    AccountStore.removeChangeListener(this.updateAccount);
    TransactionStore.removeChangeListener(this.changeTransactions);
    TransactionStore.removeAddListener(this.updateTransaction);
    TransactionStore.removeUpdateListener(this.updateTransaction);
    TransactionStore.removeDeleteListener(this._deleteData);
  }

  render() {
    return (
      <div>
        <h2 style={{padding: '0 0 10px 34px'}}>{ this.state.category ? this.state.category.name : '' }</h2>
        <div>
          { this.state.loading ?
            <div style={styles.loading}>
              <CircularProgress />
            </div>
          :
            <div>
              {
                this.state.transactions.length === 0 ?
                <p>You have no transaction</p>
                :
                <TransactionTable
                  transactions={this.state.transactions}
                  categories={this.state.categories}
                  onEdit={this.state.onEditTransaction}
                  onDuplicate={this.state.onDuplicationTransaction}
                  pagination="40"
                  dateFormat="DD MMM YY">
                </TransactionTable>
              }
            </div>
          }
        </div>
      </div>
    );
  }
}



export default muiThemeable()(Category);
