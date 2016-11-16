import dispatcher from '../dispatcher/AppDispatcher';

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
    dispatcher.dispatch({
      type: TRANSACTIONS_UPDATE_REQUEST,
      transaction: transaction
    });
  },

  delete: (transaction) => {
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
