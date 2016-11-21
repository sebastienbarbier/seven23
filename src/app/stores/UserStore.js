import {
  USER_LOGIN,
  USER_LOGOUT,
  CHANGE_EVENT,
  USER_UPDATE_REQUEST,
  USER_DELETE_REQUEST
} from '../constants';

import dispatcher from '../dispatcher/AppDispatcher';
import AccountStore from './AccountStore';
import CategoryStore from './CategoryStore';
import CurrencyStore from './CurrencyStore';
import TransactionStore from './TransactionStore';
import UserActions from '../actions/UserActions';

import axios from 'axios';
import auth from '../auth';

import { EventEmitter } from 'events';

let user = null;

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

  get user() {
    return user;
  }

  initialize() {
    return axios({
      url: '/api/init/',
      method: 'get',
      headers: {
        'Authorization': 'Token '+ localStorage.getItem('token'),
      },
    })
    .then((response) => {
      return axios({
        url: '/api/v1/users/' + response.data.id,
        method: 'get',
        headers: {
          'Authorization': 'Token '+ localStorage.getItem('token'),
        },
      });
    })
    .then((response) => {
      user = response.data;
    })
    .catch(function(ex) {
      throw new Error(ex);
    });
  }

  reset() {
    user = null;
    return Promise.resolve();
  }

  getUserId() {
    return user ? user.id : null;
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
      method: 'POST',
      data: {
        username: action.username,
        password: action.password,
      }
    })
        .then((json) => {
          console.log(json);
          localStorage.setItem('token', json.data.token);
          return auth.initialize();
        })
        .then(() => {
          UserStoreInstance.emitChange();
        })
        .catch((exception) => {
          console.error(exception);
          localStorage.removeItem('token');
          UserStoreInstance.emitChange(exception.response ? exception.response.data : null);
        });
    break;
  case USER_LOGOUT:
    axios.all([
      AccountStore.reset(),
      CategoryStore.reset(),
      CurrencyStore.reset(),
      TransactionStore.reset(),
      UserStoreInstance.reset(),
      auth.reset()
    ]).then(() => {
      localStorage.removeItem('token');
      UserStoreInstance.emitChange();
    }).catch((err) => {
      console.error(err);
    });
    break;
  case USER_UPDATE_REQUEST:
    axios({
      url: '/api/v1/subscription/',
      method: 'PUT',
      headers: {
        'Authorization': 'Token '+ localStorage.getItem('token'),
      },
      data: action.user
    })
        .then((json) => {
          UserStoreInstance.emitChange(action.user);
        })
        .catch((exception) => {
          console.error(exception);
          localStorage.removeItem('token');
          UserStoreInstance.emitChange(exception.response ? exception.response.data : null);
        });
    break;
  case USER_DELETE_REQUEST:
    axios({
      url: '/api/v1/users/' + action.user.id,
      method: 'DELETE',
      headers: {
        'Authorization': 'Token '+ localStorage.getItem('token'),
      },
      data: action.user
    })
        .then((json) => {
          UserActions.logout();
        })
        .catch((exception) => {
          console.error(exception);
          UserStoreInstance.emitChange(exception.response ? exception.response.data : null);
        });
    break;
  default:
    return;
  }
});

export default UserStoreInstance;
