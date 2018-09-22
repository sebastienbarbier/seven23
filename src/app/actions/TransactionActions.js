import {
  TRANSACTIONS_CREATE_REQUEST,
  TRANSACTIONS_READ_REQUEST,
  TRANSACTIONS_UPDATE_REQUEST,
  TRANSACTIONS_DELETE_REQUEST,
  TRANSACTIONS_IMPORT,
  TRANSACTIONS_EXPORT,
} from '../constants';
import axios from 'axios';

import storage from '../storage';
import encryption from '../encryption';

import Worker from '../workers/Transactions.worker';
const worker = new Worker();

var TransactionsActions = {

  sync: () => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        // If no accounts we return empty list of transactions
        if (getState().user.accounts.length === 0) {
          dispatch({
            type: TRANSACTIONS_READ_REQUEST,
            transactions: [],
          });
          resolve();
        } else {

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

                    encryption.decrypt(obj.blob === '' ? '{}' : obj.blob).then((json) => {
                      obj = Object.assign({}, obj, json);
                      delete obj.blob;

                      if (obj.amount) {
                        obj.local_amount = obj.amount;
                        delete obj.amount;
                      }

                      if (obj.date && obj.name) {
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

                        const saveObject = (obj) => {

                          var request = customerObjectStore.add(obj);
                          request.onsuccess = function(event) {
                            addObject(i);
                          };
                          request.onerror = function(event) {
                            reject(event);
                          };
                        };

                        // If data were enrypted, Jose.JWT cut indexedebd connection so we need
                        // to catch that case and reconnect to continue storing our data.
                        try {
                          saveObject(obj);
                        } catch (exception) {
                          if (exception instanceof DOMException) {
                            customerObjectStore = connection
                              .transaction('transactions', 'readwrite')
                              .objectStore('transactions');
                            saveObject(obj);
                          } else {
                            reject(exception);
                          }
                        }
                      } else {
                        addObject(i);
                      }
                    }).catch((exception) => {
                      console.error(exception);
                    });
                  } else {
                    worker.onmessage = function(event) {
                      if (event.data.type === TRANSACTIONS_READ_REQUEST && !event.data.exception) {
                        dispatch({
                          type: TRANSACTIONS_READ_REQUEST,
                          transactions: event.data.transactions,
                        });

                        resolve();
                      } else {
                        reject(event.data.exception);
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
        }
      });
    };
  },

  refresh: () => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        worker.onmessage = function(event) {
          if (event.data.type === TRANSACTIONS_READ_REQUEST && !event.data.exception) {
            dispatch({
              type: TRANSACTIONS_READ_REQUEST,
              transactions: event.data.transactions,
            });
            resolve();
          } else {
            console.error(event.data.exception);
            reject(event.data.exception);
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
          cipher: getState().user.cipher,
        });
      });
    };
  },

  create: transaction => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {


        worker.onmessage = function(event) {
          if (event.data.type === TRANSACTIONS_CREATE_REQUEST && !event.data.exception) {
            dispatch({
              type: TRANSACTIONS_CREATE_REQUEST,
              transaction: event.data.transaction,
            });

            resolve();
          } else {
            console.error(event.data.exception);
            reject(event.data.exception);
          }
        };
        worker.onerror = function(exception) {
          console.log(exception);
        };

        localStorage.setItem('lastCurrencyUsed', transaction.local_currency);

        worker.postMessage({
          type: TRANSACTIONS_CREATE_REQUEST,
          account: getState().account.id,
          url: getState().server.url,
          token: getState().user.token,
          currency: getState().account.currency,
          cipher: getState().user.cipher,
          transaction
        });
      });
    };
  },

  update: transaction => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {

        worker.onmessage = function(event) {
          if (event.data.type === TRANSACTIONS_UPDATE_REQUEST && !event.data.exception) {
            dispatch({
              type: TRANSACTIONS_UPDATE_REQUEST,
              transaction: event.data.transaction,
            });

            resolve();
          } else {
            console.error(event.data.exception);
            reject(event.data.exception);
          }
        };
        worker.onerror = function(exception) {
          console.log(exception);
        };

        localStorage.setItem('lastCurrencyUsed', transaction.local_currency);

        worker.postMessage({
          type: TRANSACTIONS_UPDATE_REQUEST,
          account: getState().account.id,
          url: getState().server.url,
          token: getState().user.token,
          currency: getState().account.currency,
          cipher: getState().user.cipher,
          transaction
        });
      });
    };
  },

  delete: transaction => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {

        worker.onmessage = function(event) {
          if (event.data.type === TRANSACTIONS_DELETE_REQUEST && !event.data.exception) {
            dispatch({
              type: TRANSACTIONS_DELETE_REQUEST,
              id: event.data.id,
            });

            resolve();
          } else {
            console.error(event.data.exception);
            reject(event.data.exception);
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
          cipher: getState().user.cipher,
          transaction
        });
      });
    };
  },

  import: (transaction, account) => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {

        worker.onmessage = function(event) {
          if (event.data.type === TRANSACTIONS_IMPORT && !event.data.exception) {
            resolve(event.data.transaction);
          } else {
            console.error(event.data.exception);
            reject(event.data.exception);
          }
        };
        worker.onerror = function(exception) {
          console.log(exception);
        };

        worker.postMessage({
          type: TRANSACTIONS_IMPORT,
          account: account.id,
          url: getState().server.url,
          token: getState().user.token,
          currency: account.currency,
          cipher: getState().user.cipher,
          transaction
        });
      });
    };
  },

  export: (id) => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        worker.onmessage = function(event) {
          if (event.data.type === TRANSACTIONS_EXPORT) {
            resolve({
              transactions: event.data.transactions
            });
          } else {
            console.error(event);
            reject(event);
          }
        };
        worker.postMessage({
          type: TRANSACTIONS_EXPORT,
          account: id
        });
      });
    };
  },
};

export default TransactionsActions;
