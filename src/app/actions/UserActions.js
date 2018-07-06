import axios from 'axios';

import dispatcher from '../dispatcher/AppDispatcher';

import {
  USER_LOGIN,
  USER_LOGOUT,
  USER_UPDATE_REQUEST,
  USER_FETCH_TOKEN,
  USER_FETCH_PROFILE,
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

  update: user => {
    return (dispatch, getState) => {
      return axios({
        url: '/api/v1/rest-auth/user/',
        method: 'PATCH',
        headers: {
          Authorization: 'Token ' + getState().user.token,
        },
        data: user,
      })
        .then(json => {
          dispatch({
            type: USER_UPDATE_REQUEST,
            profile: json.data,
          });
        })
        .catch(exception => {
          console.error(exception);
        });
    };
  },


  delete: user => {
    return (dispatch, getState) => {
      return axios({
        url: '/api/v1/users/' + user.id,
        method: 'DELETE',
        headers: {
          Authorization: 'Token ' + getState().user.token,
        },
        data: user,
      })
        .then(json => {
          dispatch(UserActions.logout());
        })
        .catch(exception => {
          console.error(exception);
        });
    };
  },

  changeEmail: data => {
    return (dispatch, getState) => {
      return axios({
        url: '/api/v1/users/email',
        method: 'POST',
        headers: {
          Authorization: 'Token ' + getState().user.token,
        },
        data: {
          email: data.email,
        },
      })
        .then(json => {
          dispatch({
            type: USER_UPDATE_REQUEST,
            profile: json.data,
          });
        })
        .catch((error) => {
          if (error.response.status !== 400) {
            console.error(error);
          }
          return Promise.reject(error.response.data);
        });
    };
  },

  changePassword: data => {
    return (dispatch, getState) => {
      return axios({
        url: '/api/v1/rest-auth/password/change/',
        method: 'POST',
        headers: {
          Authorization: 'Token ' + getState().user.token,
        },
        data: data,
      })
        .catch((error) => {
          if (error.response.status !== 400) {
            console.error(error);
          }
          return Promise.reject(error.response.data);
        });
    };
  },

  revokeToken: () => {

    return (dispatch, getState) => {
      return axios({
        url: '/api/v1/users/token',
        method: 'DELETE',
        headers: {
          Authorization: 'Token ' + getState().user.token,
        },
      })
        .then(response => {
          dispatch(UserActions.logout());
        })
        .catch(exception => {
          console.error(exception);
        });
    };
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
};

export default UserActions;
