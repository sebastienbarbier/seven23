import axios from 'axios';
import dispatcher from '../dispatcher/AppDispatcher';

import {
  ACCOUNTS_SYNC_REQUEST,
  ACCOUNTS_UPDATE_REQUEST,
  ACCOUNTS_CREATE_REQUEST,
  ACCOUNTS_DELETE_REQUEST,
  ACCOUNTS_CURRENCY_REQUEST,
} from '../constants';

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
    dispatcher.dispatch({
      type: ACCOUNTS_CREATE_REQUEST,
      account: account,
    });
  },

  update: account => {
    dispatcher.dispatch({
      type: ACCOUNTS_UPDATE_REQUEST,
      account: account,
    });
  },

  delete: id => {
    dispatcher.dispatch({
      type: ACCOUNTS_DELETE_REQUEST,
      id: id,
    });
  },

  switchCurrency: account => {
    dispatcher.dispatch({
      type: ACCOUNTS_CURRENCY_REQUEST,
      account: account,
    });
  },
};

export default AccountsActions;
