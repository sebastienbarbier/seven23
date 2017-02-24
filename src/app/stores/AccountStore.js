
import {
  CHANGE_EVENT,
  ACCOUNTS_UPDATE_REQUEST,
  ACCOUNTS_CREATE_REQUEST,
} from '../constants';

import dispatcher from '../dispatcher/AppDispatcher';
import { EventEmitter } from 'events';

import axios from 'axios';

let accounts = [];

class AccountStore extends EventEmitter {

  constructor() {
    super();
  }

  emitChange() {
    this.emit(CHANGE_EVENT);
  }

  addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback);
  }

  removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }

  get accounts() {
    return accounts;
  }

  selectedAccount() {
    return accounts[0] ? accounts[0] : {};
  }

  initialize() {
    return axios({
        url: '/api/v1/accounts',
        method: 'get',
        headers: {
          'Authorization': 'Token '+ localStorage.getItem('token'),
        },
      })
      .then(function(response) {
        accounts = response.data;
        AccountStoreInstance.emitChange();
      }).catch(function(ex) {
        throw new Error(ex);
      });
  }

  reset() {
    accounts = [];
    return Promise.resolve();
  }
}

let AccountStoreInstance = new AccountStore();

AccountStoreInstance.dispatchToken = dispatcher.register(action => {

  switch(action.type) {
  case ACCOUNTS_UPDATE_REQUEST:
      // do nothing
    accounts[0] = action.account;
    axios({
      url: '/api/v1/accounts/' + action.account.id,
      method: 'PUT',
      headers: {
        'Authorization': 'Token '+ localStorage.getItem('token'),
      },
      data: action.account
    })
    .then((response) => {
      // Do not
      AccountStoreInstance.emitChange();
    }).catch((exception) => {
      console.error(exception);
    });
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
      // Do not
      accounts = [response.body];
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
