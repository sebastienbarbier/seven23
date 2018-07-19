import axios from 'axios';

import {
  ACCOUNTS_SYNC_REQUEST,
  ACCOUNTS_UPDATE_REQUEST,
  ACCOUNTS_CREATE_REQUEST,
  ACCOUNTS_DELETE_REQUEST,
  ACCOUNTS_CURRENCY_REQUEST,
  SERVER_SYNCED
} from '../constants';

import TransactionActions from './TransactionActions';

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
};

export default AccountsActions;
