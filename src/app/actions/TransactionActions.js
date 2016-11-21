import dispatcher from '../dispatcher/AppDispatcher';
import TransactionModel from '../models/Transaction';

import {
  TRANSACTIONS_CREATE_REQUEST,
  TRANSACTIONS_READ_REQUEST,
  TRANSACTIONS_UPDATE_REQUEST,
  TRANSACTIONS_DELETE_REQUEST,
} from "../constants";

var TransactionsActions = {

  /**
   * @param  {string} transaction
   */
  create: (transaction) => {
    if (!transaction instanceof TransactionModel) {
      throw new Error('TransactionsActions.create argument need to be a TransactionModel instance');
    }
    dispatcher.dispatch({
      type: TRANSACTIONS_CREATE_REQUEST,
      transaction: transaction
    });
  },

  read: (id) => {
    dispatcher.dispatch({
      type: TRANSACTIONS_READ_REQUEST,
      id: id
    });
  },

  requestByDate: (year, month) => {
    dispatcher.dispatch({
      type: TRANSACTIONS_READ_REQUEST,
      year: year,
      month: month ? (month < 10 ? '0' : '') + month : null,
    });
  },

  requestByCategory: (id) => {
    dispatcher.dispatch({
      type: TRANSACTIONS_READ_REQUEST,
      category: id
    });
  },

  update: (transaction) => {
    if (!transaction instanceof TransactionModel) {
      throw new Error('TransactionsActions.update argument need to be a TransactionModel instance');
    }
    dispatcher.dispatch({
      type: TRANSACTIONS_UPDATE_REQUEST,
      transaction: transaction
    });
  },

  delete: (transaction) => {
    if (!transaction instanceof TransactionModel) {
      throw new Error('TransactionsActions.delete argument need to be a TransactionModel instance');
    }
    dispatcher.dispatch({
      type: TRANSACTIONS_DELETE_REQUEST,
      transaction: transaction
    });
  },

  readAll: () => {
    dispatcher.dispatch({
      type: TRANSACTIONS_READ_REQUEST
    });
  },

};

export default TransactionsActions;
