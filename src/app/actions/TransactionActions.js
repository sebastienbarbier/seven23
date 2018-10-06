import {
  TRANSACTIONS_CREATE_REQUEST,
  TRANSACTIONS_READ_REQUEST,
  TRANSACTIONS_UPDATE_REQUEST,
  TRANSACTIONS_DELETE_REQUEST,
  TRANSACTIONS_SYNC_REQUEST,
  TRANSACTIONS_IMPORT,
  TRANSACTIONS_EXPORT,
  SERVER_LAST_EDITED,
  SERVER_SYNC,
  SERVER_SYNCED,
} from '../constants';
import axios from 'axios';

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

          const { last_sync } = getState().server;
          let url = '/api/v1/debitscredits';
          if (last_sync) {
            url = url + '?last_edited=' + last_sync;
          }
          axios({
            url: url,
            method: 'get',
            headers: {
              Authorization: 'Token ' + getState().user.token,
            },
          })
            .then(function(response) {
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
                last_sync
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

        dispatch({
          type: SERVER_SYNC
        });
        worker.onmessage = function(event) {
          if (event.data.type === TRANSACTIONS_CREATE_REQUEST && !event.data.exception) {
            dispatch({
              type: TRANSACTIONS_CREATE_REQUEST,
              transaction: event.data.transaction,
            });
            dispatch({
              type: SERVER_SYNCED
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

      dispatch({
        type: SERVER_SYNC
      });
      return new Promise((resolve, reject) => {

        worker.onmessage = function(event) {
          if (event.data.type === TRANSACTIONS_UPDATE_REQUEST && !event.data.exception) {

            dispatch({
              type: TRANSACTIONS_UPDATE_REQUEST,
              transaction: event.data.transaction,
            });
            dispatch({
              type: SERVER_SYNCED
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
            dispatch({
              type: SERVER_SYNCED
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
