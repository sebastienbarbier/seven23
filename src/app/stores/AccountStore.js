
import {
  CHANGE_EVENT,
  ACCOUNTS_UPDATE_REQUEST,
  ACCOUNTS_CREATE_REQUEST,
  ACCOUNTS_DELETE_REQUEST,
  ACCOUNTS_CURRENCY_REQUEST,
} from '../constants';

import dispatcher from '../dispatcher/AppDispatcher';
import storage from '../storage';
import { EventEmitter } from 'events';

import axios from 'axios';

let accounts = [];
let account;

class AccountStore extends EventEmitter {

  constructor() {
    super();
  }

  emitChange() {
    this.emit(CHANGE_EVENT, accounts);
  }

  addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback);
  }

  onceChangeListener(callback) {
    this.once(CHANGE_EVENT, callback);
  }

  removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }

  get accounts() {
    return accounts;
  }

  get account() {
    return account;
  }

  selectedAccount() {
    return accounts.find((account) => {
      return ''+account.id === ''+localStorage.getItem('account');
    });
  }

  initialize() {
    const that = this;
    return axios({
        url: '/api/v1/accounts',
        method: 'get',
        headers: {
          'Authorization': 'Token '+ localStorage.getItem('token'),
        },
      })
      .then(function(response) {
        accounts = response.data;
        if (accounts.length !== 0) {
          if (!that.selectedAccount()) {
            localStorage.setItem('account', accounts[0].id);
          }
        }
        // Return confirmation it is done :)
        AccountStoreInstance.emitChange();
      }).catch(function(ex) {
        throw new Error(ex);
      });
  }

  reset() {
    return new Promise((resolve) => {
      accounts = [];
      resolve();
    });
  }
}

let AccountStoreInstance = new AccountStore();

AccountStoreInstance.dispatchToken = dispatcher.register(action => {

  switch(action.type) {
  case ACCOUNTS_UPDATE_REQUEST:
      // do nothing
    axios({
      url: '/api/v1/accounts/' + action.account.id,
      method: 'PUT',
      headers: {
        'Authorization': 'Token '+ localStorage.getItem('token'),
      },
      data: action.account
    })
    .then((response) => {
      accounts = accounts.filter((account) => {
        return account.id !== response.data.id;
      });
      accounts.push(response.data);
      AccountStoreInstance.emitChange();
    }).catch((exception) => {
      console.error(exception);
    });
    break;

  case ACCOUNTS_CURRENCY_REQUEST:
    // We update current account
    accounts = accounts.filter((account) => {
      return account.id !== action.account.id;
    });
    accounts.push(action.account);

    axios({
      url: '/api/v1/accounts/' + action.account.id,
      method: 'PUT',
      headers: {
        'Authorization': 'Token '+ localStorage.getItem('token'),
      },
      data: action.account
    })
    .catch((exception) => {
      console.error(exception);
    });
    setTimeout(() => {
      AccountStoreInstance.emitChange();
    }, 100);
    break;
  case ACCOUNTS_CREATE_REQUEST:
    axios({
      url: '/api/v1/accounts',
      method: 'POST',
      headers: {
        'Authorization': 'Token '+ localStorage.getItem('token'),
      },
      data: action.account
    })
    .then((response) => {
      if (accounts.length === 0) {
        accounts = [response.data];
      } else {
        accounts.push(response.data);
      }
      AccountStoreInstance.emitChange();
    }).catch((exception) => {
      console.error(exception);
    });
    break;

  case ACCOUNTS_DELETE_REQUEST:
    axios({
      url: '/api/v1/accounts/' + action.id,
      method: 'DELETE',
      headers: {
        'Authorization': 'Token '+ localStorage.getItem('token'),
      }
    })
    .then((response) => {
      accounts = accounts.filter((account) => {
        return account.id !== action.id;
      });
      AccountStoreInstance.emitChange();
    }).catch((exception) => {
      console.error(exception);
    });
    break;

  default:
    return;
  }

});

export default AccountStoreInstance;
