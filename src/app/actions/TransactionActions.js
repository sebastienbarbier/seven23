import {
  TRANSACTIONS_CREATE_REQUEST,
  TRANSACTIONS_READ_REQUEST,
  TRANSACTIONS_UPDATE_REQUEST,
  TRANSACTIONS_DELETE_REQUEST,
} from '../constants';
import axios from 'axios';

import storage from '../storage';

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
                    url: getState().server.url,
                    token: getState().user.token,
                    currency: getState().account.currency,
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

  create: transaction => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {

        worker.onmessage = function(event) {
          if (event.data.type === TRANSACTIONS_CREATE_REQUEST) {
            dispatch({
              type: TRANSACTIONS_CREATE_REQUEST,
              transaction: event.data.transaction,
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
          type: TRANSACTIONS_CREATE_REQUEST,
          account: getState().account.id,
          url: getState().server.url,
          token: getState().user.token,
          currency: getState().account.currency,
          transaction
        });
      });
    };
  },

  update: transaction => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {

        worker.onmessage = function(event) {
          if (event.data.type === TRANSACTIONS_UPDATE_REQUEST) {
            dispatch({
              type: TRANSACTIONS_UPDATE_REQUEST,
              transaction: event.data.transaction,
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
          type: TRANSACTIONS_UPDATE_REQUEST,
          account: getState().account.id,
          url: getState().server.url,
          token: getState().user.token,
          currency: getState().account.currency,
          transaction
        });
      });
    };
  },

  delete: transaction => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {

        worker.onmessage = function(event) {
          if (event.data.type === TRANSACTIONS_DELETE_REQUEST) {
            dispatch({
              type: TRANSACTIONS_DELETE_REQUEST,
              id: event.data.id,
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
          type: TRANSACTIONS_DELETE_REQUEST,
          account: getState().account.id,
          url: getState().server.url,
          token: getState().user.token,
          currency: getState().account.currency,
          transaction
        });
      });
    };
  },
};

export default TransactionsActions;
