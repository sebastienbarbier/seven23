import dispatcher from '../dispatcher/AppDispatcher';

import {
  USER_LOGIN,
  USER_LOGOUT,
  USER_UPDATE_REQUEST,
  USER_DELETE_REQUEST,
  USER_CHANGE_PASSWORD,
  USER_REVOKE_TOKEN
} from '../constants';

var UserActions = {

  /**
   * @param  {string} category
   */
  login: (username, password) => {
    dispatcher.dispatch({
      type: USER_LOGIN,
      username: username,
      password: password,
    });
  },

  logout: () => {
    dispatcher.dispatch({
      type: USER_LOGOUT
    });
  },

  changePassword: (data) => {
    dispatcher.dispatch({
      type: USER_CHANGE_PASSWORD,
      data: data,
    });
  },

  revokeToken: () => {
    dispatcher.dispatch({
      type: USER_REVOKE_TOKEN
    });
  },

  update: (user) => {
    dispatcher.dispatch({
      type: USER_UPDATE_REQUEST,
      user: user,
    });
  },

  delete: (user) => {
    dispatcher.dispatch({
      type: USER_DELETE_REQUEST,
      user: user,
    });
  },

};

export default UserActions;
