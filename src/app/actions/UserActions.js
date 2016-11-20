import dispatcher from '../dispatcher/AppDispatcher';

import {
  USER_LOGIN,
  USER_LOGOUT,
  USER_UPDATE_REQUEST,
} from "../constants";

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

  update: (user) => {
    dispatcher.dispatch({
      type: USER_UPDATE_REQUEST,
      user: user,
    });
  },

};

export default UserActions;
