import axios from 'axios';

import {
  ACCOUNTS_SYNC_REQUEST,
  ACCOUNTS_UPDATE_REQUEST,
  ACCOUNTS_CREATE_REQUEST,
  ACCOUNTS_DELETE_REQUEST,
  ACCOUNTS_CURRENCY_REQUEST,
  ACCOUNTS_SWITCH_REQUEST,
  ACCOUNTS_IMPORT,
  ACCOUNTS_IMPORT_UPDATE,
  SERVER_SYNCED
} from '../constants';
import encryption from '../encryption';

import TransactionActions from './TransactionActions';
import ChangeActions from './ChangeActions';
import CategoryActions from './CategoryActions';

import Worker from '../workers/Accounts.worker';
const worker = new Worker();

var AccountsActions = {

  sync : () => {
    return (dispatch, getState) => {
      return axios({
        url: '/api/v1/accounts',
        method: 'get',
        headers: {
          Authorization: 'Token ' + getState().user.token,
        },
      })
        .then(function(response) {
          const accounts = response.data;
          if (accounts.length !== 0) {
            if (!localStorage.getItem('account')) {
              localStorage.setItem('account', accounts[0].id);
            }
          }
          dispatch({
            type: ACCOUNTS_SYNC_REQUEST,
            accounts
          });
          return Promise.resolve(accounts);
        })
        .catch(function(ex) {
          throw new Error(ex);
        });
    };
  },

  create: account => {

    return (dispatch, getState) => {
      return axios({
        url: '/api/v1/accounts',
        method: 'POST',
        headers: {
          Authorization: 'Token ' + getState().user.token,
        },
        data: account,
      })
        .then(response => {
          if (getState().user.accounts.length === 0) {
            localStorage.setItem('account', response.data.id);
          }
          dispatch({
            type: ACCOUNTS_CREATE_REQUEST,
            account: response.data,
          });
          return Promise.resolve(response.data);
        })
        .catch(error => {
          if (error.response.status !== 400) {
            console.error(error);
          }
          return Promise.reject(error.response);
        });
    };
  },

  update: account => {

    return (dispatch, getState) => {
      axios({
        url: '/api/v1/accounts/' + account.id,
        method: 'PUT',
        headers: {
          Authorization: 'Token ' + getState().user.token,
        },
        data: account,
      })
        .then(response => {
          dispatch({
            type: ACCOUNTS_UPDATE_REQUEST,
            account: account,
          });
          return Promise.resolve();
        })
        .catch(error => {
          if (error.response.status !== 400) {
            console.error(error);
          }
          return Promise.reject(error.response);
        });
    };
  },

  delete: id => {
    return (dispatch, getState) => {
      return axios({
        url: '/api/v1/accounts/' + id,
        method: 'DELETE',
        headers: {
          Authorization: 'Token ' + getState().user.token,
        },
      })
        .then(response => {
          dispatch({
            type: ACCOUNTS_DELETE_REQUEST,
            id: id,
          });
          return Promise.resolve();
        })
        .catch(error => {
          console.log(error);
          if (error.status === 204) {

            dispatch({
              type: ACCOUNTS_DELETE_REQUEST,
              id: id,
            });
            return Promise.resolve();

          } else if (error.status !== 400) {
            console.error(error);
          }
          return Promise.reject(error.response);
        });
    };
  },

  switchCurrency: currency => {
    return (dispatch, getState) => {

      return new Promise((resolve, reject) => {
        dispatch({
          type: ACCOUNTS_CURRENCY_REQUEST,
          currency: currency,
        });

        dispatch(TransactionActions.refresh()).then(() => {
          dispatch({
            type: SERVER_SYNCED,
          });
          resolve();
        }).catch(() => {
          dispatch({
            type: SERVER_SYNCED,
          });
          resolve();
        });
      });
    };
  },

  switchAccount: account => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        dispatch({
          type: ACCOUNTS_SWITCH_REQUEST,
          account: account,
        });
        localStorage.setItem('account', account.id);

        Promise.all([
          dispatch(ChangeActions.refresh()),
          dispatch(CategoryActions.refresh()),
        ]).then(() => {
          return dispatch(TransactionActions.refresh());
        }).then(() => {
          dispatch({
            type: SERVER_SYNCED,
          });
          resolve();
        }).catch(() => {
          dispatch({
            type: SERVER_SYNCED,
          });
          reject();
        });
      });
    };
  },

  // Dirty import script but works like a charm (except ... performances of course).
  import: (json) => {
    return (dispatch, getState) => {

      return new Promise((resolve, reject) => {

        worker.onmessage = function(event) {
          const { type } = event.data;
          if (type === ACCOUNTS_IMPORT && !event.data.exception) {

            Promise.all([
              TransactionActions.refresh(),
              ChangeActions.refresh(),
              CategoryActions.refresh(),
            ]).then(() => {
              resolve();
            }).catch(() => {
              reject();
            });

          } else if (type === ACCOUNTS_IMPORT_UPDATE && !event.data.exception) {

            const { progress } = event.data;
            dispatch({ type: ACCOUNTS_IMPORT_UPDATE, progress });

          } else {
            console.error(event.data.exception);
            reject(event.data.exception);
          }
        };
        worker.onerror = function(exception) {
          console.log(exception);
        };

        worker.postMessage({
          type: ACCOUNTS_IMPORT,
          token: getState().user.token,
          url: getState().server.url,
          cipher: getState().user.cipher,
          json,
        });
      });
    };
  },

  export: (id) => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        const promises = [
          dispatch(TransactionActions.export(id)),
          dispatch(ChangeActions.export(id)),
          dispatch(CategoryActions.export(id)),
        ];

        Promise.all(promises).then((args) => {
          const { account, server } = getState();

          resolve(Object.assign(
            {},
            ...args,
            { account },
            { server:
              {
                url: server.url,
                name: server.name,
                contact: server.contact,
              }
            }
          ));
        }).catch((exception) => {
          console.error(exception);
          reject(exception);
        });
      });

    };
  },
};

export default AccountsActions;
