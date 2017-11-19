import {
  TRANSACTIONS_CREATE_REQUEST,
  TRANSACTIONS_READ_REQUEST,
  TRANSACTIONS_UPDATE_REQUEST,
  TRANSACTIONS_DELETE_REQUEST,
} from '../constants';

import dispatcher from '../dispatcher/AppDispatcher';

import AccountStore from '../stores/AccountStore';

var TransactionsActions = {
  /**
   * @param  {string} transaction
   */
  create: transaction => {
    dispatcher.dispatch({
      type: TRANSACTIONS_CREATE_REQUEST,
      url: localStorage.getItem('server'),
      token: localStorage.getItem('token'),
      currency: AccountStore.selectedAccount().currency,
      transaction: transaction,
    });
  },

  read: (data = {}) => {
    dispatcher.dispatch({
      type: TRANSACTIONS_READ_REQUEST,
      includeCurrentYear: data.includeCurrentYear || false,
      includeTrend: data.includeTrend || false,
      url: localStorage.getItem('server'),
      token: localStorage.getItem('token'),
      account: data.account || AccountStore.selectedAccount().id,
      currency: AccountStore.selectedAccount().currency,
      id: data.id,
      category: data.category,
      dateBegin: data.dateBegin,
      dateEnd: data.dateEnd,
    });
  },

  update: transaction => {
    dispatcher.dispatch({
      type: TRANSACTIONS_UPDATE_REQUEST,
      url: localStorage.getItem('server'),
      token: localStorage.getItem('token'),
      currency: AccountStore.selectedAccount().currency,
      transaction: transaction,
    });
  },

  delete: transaction => {
    dispatcher.dispatch({
      type: TRANSACTIONS_DELETE_REQUEST,
      url: localStorage.getItem('server'),
      token: localStorage.getItem('token'),
      transaction: transaction,
    });
  },
};

export default TransactionsActions;
