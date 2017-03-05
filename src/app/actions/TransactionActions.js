import {
  TRANSACTIONS_CREATE_REQUEST,
  TRANSACTIONS_READ_REQUEST,
  TRANSACTIONS_UPDATE_REQUEST,
  TRANSACTIONS_DELETE_REQUEST,
} from '../constants';

import dispatcher from '../dispatcher/AppDispatcher';

import TransactionModel from '../models/Transaction';
import AccountStore from '../stores/AccountStore';


var TransactionsActions = {

  /**
   * @param  {string} transaction
   */
  create: (transaction) => {
    if (transaction instanceof TransactionModel === false) {
      throw new Error('TransactionsActions.create argument need to be a TransactionModel instance');
    }
    dispatcher.dispatch({
      type: TRANSACTIONS_CREATE_REQUEST,
      url: localStorage.getItem('server'),
      token: localStorage.getItem('token'),
      transaction: transaction.toJSON()
    });
  },

  read: (data = {}) => {
    dispatcher.dispatch({
      type: TRANSACTIONS_READ_REQUEST,
      url: localStorage.getItem('server'),
      token: localStorage.getItem('token'),
      account: data.account || AccountStore.selectedAccount().id,
      id: data.id,
      category: data.category,
      year: data.year,
      month: data.month ? (data.month < 10 ? '0' : '') + data.month : null,
    });
  },

  update: (transaction) => {
    if (transaction instanceof TransactionModel === false) {
      throw new Error('TransactionsActions.update arguments need to be a TransactionModel instance');
    }
    dispatcher.dispatch({
      type: TRANSACTIONS_UPDATE_REQUEST,
      url: localStorage.getItem('server'),
      token: localStorage.getItem('token'),
      transaction: transaction.toJSON()
    });
  },

  delete: (transaction) => {
    if (transaction instanceof TransactionModel === false) {
      throw new Error('TransactionsActions.delete argument need to be a TransactionModel instance');
    }
    dispatcher.dispatch({
      type: TRANSACTIONS_DELETE_REQUEST,
      url: localStorage.getItem('server'),
      token: localStorage.getItem('token'),
      transaction: transaction.toJSON()
    });
  },

};

export default TransactionsActions;
