import {
  TRANSACTIONS_CREATE_REQUEST,
  TRANSACTIONS_READ_REQUEST,
  TRANSACTIONS_UPDATE_REQUEST,
  TRANSACTIONS_DELETE_REQUEST,
} from '../constants';
import axios from 'axios';

import storage from '../storage';
import dispatcher from '../dispatcher/AppDispatcher';

import AccountStore from '../stores/AccountStore';

import Worker from '../workers/Transactions.worker';

const worker = new Worker();

var TransactionsActions = {

  sync: () => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        axios({
          url: '/api/v1/debitscredits',
          method: 'get',
          headers: {
            Authorization: 'Token ' + getState().user.token,
          },
        })
          .then(function(response) {
            // Load transactions store
            storage.connectIndexedDB().then(connection => {
              var customerObjectStore = connection
                .transaction('transactions', 'readwrite')
                .objectStore('transactions');
              // Delete all previous objects
              customerObjectStore.clear();

              let minDate = new Date();
              let maxDate = new Date();
              const addObject = i => {
                var obj = i.next();
                if (obj && obj.value) {
                  obj = obj.value[1];

                  // Populate data for indexedb indexes
                  const year = obj.date.slice(0, 4);
                  const month = obj.date.slice(5, 7);
                  const day = obj.date.slice(8, 10);
                  obj.date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));

                  if (obj.date > maxDate) { maxDate = obj.date; }
                  if (obj.date < minDate) { minDate = obj.date; }

                  if (!obj.category) {
                    delete obj.category;
                  }

                  var request = customerObjectStore.add(obj);
                  request.onsuccess = function(event) {
                    addObject(i);
                  };
                  request.onerror = function(event) {
                    console.error(event);
                    reject(event);
                  };
                } else {
                  worker.onmessage = function(event) {
                    if (event.data.type === TRANSACTIONS_READ_REQUEST) {
                      dispatch({
                        type: TRANSACTIONS_READ_REQUEST,
                        dateBegin: event.data.dateBegin,
                        dateEnd: event.data.dateEnd,
                        trend: event.data.trend,
                        currentYear: event.data.currentYear,
                        stats: {
                          incomes: event.data.stats.incomes,
                          expenses: event.data.stats.expenses,
                          perDates: event.data.stats.perDates,
                          perCategories: event.data.stats.perCategories, // {'id', 'incomes', 'expenses'}
                        },
                        transactions: event.data.transactions,
                      });

                      resolve();
                    } else {
                      console.error(event);
                      reject(event);
                    }
                  };
                  worker.onerror = function(exception) {
                    console.log(exception);
                  };
                  worker.postMessage({
                    type: TRANSACTIONS_READ_REQUEST,
                    account: getState().account.id,
                    includeCurrentYear: true,
                    includeTrend: true,
                    // url: localStorage.getItem('server'),
                    // token: localStorage.getItem('token'),
                    currency: getState().account.currency,
                    dateBegin: minDate,
                    dateEnd: maxDate,
                  });
                }
              };

              var iterator = response.data.entries();
              addObject(iterator);
            });
          })
          .catch(function(ex) {
            console.error(ex);
            reject(ex);
          });
      });
    };
  },

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
