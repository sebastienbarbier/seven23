import {
  TRANSACTIONS_CREATE_REQUEST,
  TRANSACTIONS_READ_REQUEST,
  TRANSACTIONS_UPDATE_REQUEST,
  TRANSACTIONS_DELETE_REQUEST,
  TRANSACTIONS_SYNC_REQUEST,
  TRANSACTIONS_EXPORT,
  SERVER_LAST_EDITED,
  UPDATE_ENCRYPTION,
  ENCRYPTION_KEY_CHANGED,
  SNACKBAR,
  DB_NAME,
  DB_VERSION,
  FLUSH,
} from '../constants';
import axios from 'axios';
import storage from '../storage';
import encryption from '../encryption';

import Worker from '../workers/Transactions.worker';
const worker = new Worker();

function generateBlob(transaction) {
  const blob = {};

  blob.name = transaction.name;
  const date = new Date(transaction.date);
  blob.date = `${date.getFullYear()}-${('0' + (date.getMonth()+1) ).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;
  blob.local_amount = transaction.originalAmount;
  blob.local_currency = transaction.originalCurrency;

  return blob;
}

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

          const sync_transactions = getState().sync.transactions;

          const create_promise = new Promise((resolve, reject) => {
            if (sync_transactions.create && sync_transactions.create.length) {
              let promises = [];
              let transactions = [];

              getState().transactions.filter(c => sync_transactions.create.indexOf(c.id) != -1).forEach((t) => {
                // Create a promise to encrypt data
                promises.push(new Promise((resolve, reject) => {

                  const blob = generateBlob(t);

                  encryption.encrypt(blob).then((json) => {

                    const transaction = {
                      account: t.account,
                      category: t.category,
                      blob: json,
                    };

                    // API return 400 if catery = null
                    if (!transaction.category) {
                      delete transaction.category;
                    }

                    transactions.push(transaction);
                    resolve();
                  }).catch(exception => {
                    console.error(exception);
                    reject(exception);
                  });
                }));
              });

              Promise.all(promises).then(_ => {
                return axios({
                  url: '/api/v1/debitscredits',
                  method: 'POST',
                  headers: {
                    Authorization: 'Token ' + getState().user.token,
                  },
                  data: transactions,
                })
                  .then(response => {

                    return storage.connectIndexedDB().then(connection => {
                      var customerObjectStore = connection
                        .transaction('transactions', 'readwrite')
                        .objectStore('transactions');
                      // Delete previous non synced objects
                      sync_transactions.create.forEach(id => {
                        customerObjectStore.delete(id);
                      });

                      resolve();
                    });
                  });
              }).catch(exception => {
                console.error(exception);
                reject(exception);
              });
            } else {
              resolve();
            }
          });
          const update_promise = new Promise((resolve) => {
            if (sync_transactions.update && sync_transactions.update.length) {
              let promises = [];
              let transactions = [];

              getState().transactions.filter(c => sync_transactions.update.indexOf(c.id) != -1).forEach((transaction) => {
                // Create a promise to encrypt data
                promises.push(new Promise((resolve, reject) => {

                  const blob = generateBlob(transaction);

                  encryption.encrypt(blob).then((json) => {

                    transaction = {
                      id: transaction.id,
                      account: transaction.account,
                      category: transaction.category,
                      blob: json,
                    };

                    // API return 400 if catery = null
                    if (!transaction.category) {
                      delete transaction.category;
                    }

                    transactions.push(transaction);
                    resolve();
                  }).catch(exception => {
                    console.error(exception);
                    reject(exception);
                  });
                }));
              });

              Promise.all(promises).then(_ => {
                axios({
                  url: '/api/v1/debitscredits',
                  method: 'PUT',
                  headers: {
                    Authorization: 'Token ' + getState().user.token,
                  },
                  data: transactions,
                })
                  .then(response => {
                    resolve();
                  }).catch(exception => {
                    reject(exception);
                  });
              }).catch(exception => {
                console.error(exception);
                reject(exception);
              });
            } else {
              resolve();
            }
          });
          const delete_promise = new Promise((resolve) => {
            if (sync_transactions.delete && sync_transactions.delete.length) {
              if (sync_transactions.delete && sync_transactions.delete.length) {
                axios({
                  url: '/api/v1/debitscredits',
                  method: 'DELETE',
                  headers: {
                    Authorization: 'Token ' + getState().user.token,
                  },
                  data: sync_transactions.delete,
                })
                  .then(response => {
                    resolve();
                  })
                  .catch(error => {
                    console.error(error);
                    reject(error.response);
                  });
              } else {
                resolve();
              }
            } else {
              resolve();
            }
          });

          Promise.all([create_promise, update_promise, delete_promise]).then(() => {

            const { last_edited } = getState().server;
            let url = '/api/v1/debitscredits';
            if (last_edited) {
              url = url + '?last_edited=' + last_edited;
            }
            axios({
              url: url,
              method: 'get',
              headers: {
                Authorization: 'Token ' + getState().user.token,
              },
            })
              .then(function(response) {
                if (response.data.length === 0) {
                  resolve();
                } else {
                  // SYNC
                  worker.onmessage = function(event) {
                    if (event.data.type === TRANSACTIONS_SYNC_REQUEST && !event.data.exception) {
                      dispatch({
                        type: SERVER_LAST_EDITED,
                        last_edited: event.data.last_edited,
                      });
                      worker.postMessage({
                        type: TRANSACTIONS_READ_REQUEST,
                        account: getState().account.id,
                        url: getState().server.url,
                        token: getState().user.token,
                        currency: getState().account.currency,
                        cipher: getState().user.cipher
                      });
                    } else if (event.data.type === TRANSACTIONS_READ_REQUEST && !event.data.exception) {
                      dispatch({
                        type: TRANSACTIONS_READ_REQUEST,
                        transactions: event.data.transactions,
                        youngest: event.data.youngest,
                        oldest: event.data.oldest,
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
                    type: TRANSACTIONS_SYNC_REQUEST,
                    account: getState().account.id,
                    url: getState().server.url,
                    token: getState().user.token,
                    currency: getState().account.currency,
                    cipher: getState().user.cipher,
                    transactions: response.data,
                    last_edited
                  });
                }
              })
              .catch(function(ex) {
                console.error(ex);
                reject(ex);
              });
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
              youngest: event.data.youngest,
              oldest: event.data.oldest,
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
        let maxId = 0;
        getState().transactions.forEach(transaction => maxId = transaction.id > maxId ? transaction.id : maxId);

        transaction.id = maxId+1;
        const year = transaction.date.getFullYear();
        const month = transaction.date.getMonth();
        const date = transaction.date.getDate();
        transaction.date = new Date(Date.UTC(year, month, date, 0, 0, 0));

        transaction.local_amount = transaction.local_amount || transaction.amount || 0;
        transaction.local_currency = transaction.local_currency || transaction.currency;

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

        dispatch({
          type: SNACKBAR,
          snackbar: {
            message: 'Transaction successfuly deleted',
            onClick: function() {
              dispatch(TransactionsActions.create(transaction))
            }
          },
        });

        let connectDB = indexedDB.open(DB_NAME, DB_VERSION);
        connectDB.onsuccess = function(event) {
          var customerObjectStore = event.target.result
            .transaction('transactions', 'readwrite')
            .objectStore('transactions');

          // Save new transaction
          var request = customerObjectStore.delete(transaction.id);

          request.onsuccess = function(event) {
            dispatch({
              type: TRANSACTIONS_DELETE_REQUEST,
              id: transaction.id,
            });
            resolve();
          };
          request.onerror = function(event) {
            console.error(event);
            reject(event);
          };
        };
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

  encrypt: (cipher, url, token) => {
    return new Promise((resolve, reject) => {
      worker.onmessage = function(event) {
        if (event.data.type === UPDATE_ENCRYPTION) {
          resolve();
        } else {
          console.error(event);
          reject(event);
        }
      };
      worker.postMessage({
        type: UPDATE_ENCRYPTION,
        cipher,
        url,
        token,
      });
    });
  },

  updateServerEncryption: (url, token, newCipher, oldCipher) => {
    return new Promise((resolve, reject) => {
      worker.onmessage = function(event) {
        if (event.data.type === ENCRYPTION_KEY_CHANGED) {
          resolve();
        } else {
          console.error(event);
          reject(event);
        }
      };
      worker.postMessage({
        type: ENCRYPTION_KEY_CHANGED,
        url,
        token,
        newCipher,
        oldCipher,
      });
    });
  },

  flush: () => {
    worker.postMessage({
      type: FLUSH,
    });
  },
};

export default TransactionsActions;