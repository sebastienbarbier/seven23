import axios from 'axios';
import md5 from 'blueimp-md5';
import encryption from '../encryption';

import {
  USER_LOGOUT,
  USER_UPDATE_REQUEST,
  USER_FETCH_TOKEN,
  USER_FETCH_PROFILE,
  USER_CHANGE_THEME,
  USER_START_LOGIN,
  USER_UPDATE_LOGIN,
  USER_STOP_LOGIN,
} from '../constants';

var UserActions = {

  setTheme: (theme = 'light') => {
    if (theme !== 'light' && theme !== 'dark') {
      throw new Error('wrong args to UserActions.setTheme', theme);
    }
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
          const { token } = json.data;
          const cipher = md5(password);

          encryption.key(md5(password));

          dispatch({
            type: USER_FETCH_TOKEN,
            token,
            cipher,
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

      encryption.key(getState().user.cipher);

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
    localStorage.removeItem('cipher');
    localStorage.removeItem('last_edited');

    encryption.reset();

    return { type: USER_LOGOUT };
  },

  create: (username, email, password1, password2, origin) => {
    return (dispatch, getState) => {
      return axios({
        url: '/api/v1/rest-auth/registration/',
        method: 'POST',
        data: {
          username: username,
          email: email,
          password1: password1,
          password2: password2,
          origin: origin,
        },
      })
        .then(response => {
          dispatch({
            type: USER_FETCH_TOKEN,
            token: response.data.key,
          });
        })
        .catch(function(exception) {
          return Promise.reject(exception);
        });
    };
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

  loginStart: () => {
    return {
      type: USER_START_LOGIN
    };
  },

  loginUpdate: () => {
    return {
      type: USER_UPDATE_LOGIN,
      isLogging: {},
    };
  },

  loginStop: () => {
    return {
      type: USER_STOP_LOGIN
    };
  },

};

export default UserActions;
