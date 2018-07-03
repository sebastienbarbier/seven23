import dispatcher from '../dispatcher/AppDispatcher';

import {
  USER_LOGIN,
  USER_LOGOUT,
  USER_UPDATE_REQUEST,
  USER_DELETE_REQUEST,
  USER_CHANGE_PASSWORD,
  USER_CHANGE_EMAIL,
  USER_REVOKE_TOKEN,
  USER_CHANGE_THEME,
} from '../constants';

var UserActions = {

  setTheme: (theme = 'light') => {
    if (theme !== 'light' && theme !== 'dark') {
      throw new Error('wrong args to UserActions.setTheme', theme);
    }
    localStorage.setItem('theme', theme);
    return {
      type: USER_CHANGE_THEME,
      theme: theme,
    };
  },

  /// LEGACY ///
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
      type: USER_LOGOUT,
    });
  },

  changePassword: data => {
    dispatcher.dispatch({
      type: USER_CHANGE_PASSWORD,
      data: data,
    });
  },

  changeEmail: data => {
    dispatcher.dispatch({
      type: USER_CHANGE_EMAIL,
      data: data,
    });
  },

  revokeToken: () => {
    dispatcher.dispatch({
      type: USER_REVOKE_TOKEN,
    });
  },


  update: user => {
    dispatcher.dispatch({
      type: USER_UPDATE_REQUEST,
      user: user,
    });
  },

  delete: user => {
    dispatcher.dispatch({
      type: USER_DELETE_REQUEST,
      user: user,
    });
  },
};

export default UserActions;
