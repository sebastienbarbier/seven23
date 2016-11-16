import {
  USER_LOGIN,
  USER_LOGOUT,
  CHANGE_EVENT
} from '../constants';

import dispatcher from '../dispatcher/AppDispatcher';
import AccountStore from './AccountStore';
import CategoryStore from './CategoryStore';
import CurrencyStore from './CurrencyStore';

import axios from 'axios';
import auth from '../auth';

import { EventEmitter } from 'events';

let userId = [];

class UserStore extends EventEmitter {

  constructor() {
    super();
  }

  emitChange(args) {
    this.emit(CHANGE_EVENT, args);
  }

  addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback);
  }

  removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }

  onceChangeListener(callback) {
    this.once(CHANGE_EVENT, callback);
  }

  initialize() {
    return axios({
      url: '/api/init/',
      method: 'get',
      headers: {
        'Authorization': 'Token '+ localStorage.getItem('token'),
      },
    })
    .then(function(response) {
      userId = response.data.id;
    }).catch(function(ex) {
      reject(ex);
    });
  }

  reset() {
    userId = null;
  }

  getUserId() {
    return userId;
  }

  loggedIn() {
    return localStorage.getItem('token') !== null;
  }

}

let UserStoreInstance = new UserStore();

UserStoreInstance.dispatchToken = dispatcher.register(action => {

  switch(action.type) {
    case USER_LOGIN:
      axios({
          url: '/api/api-token-auth/',
          method: 'post',
          data: {
            username: action.username,
            password: action.password,
          }
        })
        .then((json) => {
          localStorage.setItem('token', json.data.token);
          return auth.initialize();
        })
        .then(() => {
          UserStoreInstance.emitChange();
        })
        .catch((exception) => {
          localStorage.removeItem('token');
          UserStoreInstance.emitChange(exception.response ? exception.response.data : null);
        });
      break;
    case USER_LOGOUT:
      axios.all([
        AccountStore.reset(),
        CategoryStore.reset(),
        CurrencyStore.reset()
      ]).then(() => {
        localStorage.removeItem('token');
        UserStoreInstance.emitChange();
      })
      break;
    default:
      return;
  }

});

export default UserStoreInstance;
