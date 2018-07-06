import axios from 'axios';

import dispatcher from '../dispatcher/AppDispatcher';

import {
  USER_LOGIN,
  USER_LOGOUT,
  USER_UPDATE_REQUEST,
  USER_DELETE_REQUEST,
  USER_CHANGE_PASSWORD,
  USER_CHANGE_EMAIL,
  USER_FETCH_TOKEN,
  USER_FETCH_PROFILE,
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

  fetchToken: (username, password) => {
    return (dispatch, getState) => {
      return axios({
        url: '/api/api-token-auth/',
        method: 'POST',
        data: {
          username: username,
          password: password,
        },
      })
        .then(json => {
          const token = json.data;
          localStorage.setItem('token', token);
          dispatch({
            type: USER_FETCH_TOKEN,
            token
          });
          return Promise.resolve(token);
        })
        .catch(exception => {
          return Promise.reject(exception);
        });
    };
  },

  fetchProfile: (token) => {
    return (dispatch, getState) => {
      token = token || getState().user.token;

      return axios({
        url: '/api/v1/rest-auth/user/',
        method: 'get',
        headers: {
          Authorization: 'Token ' + token,
        },
      })
        .then(response => {
          dispatch({
            type: USER_FETCH_PROFILE,
            profile: response.data
          });
          return Promise.resolve(response.data);
        })
        .catch(exception => {
          return Promise.reject(exception);
        });
    };
  },

  logout: () => {
    localStorage.removeItem('token');
    return { type: USER_LOGOUT };
  },

  /// LEGACY CODE ///
  //
  login: (username, password) => {
    dispatcher.dispatch({
      type: USER_LOGIN,
      username: username,
      password: password,
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
