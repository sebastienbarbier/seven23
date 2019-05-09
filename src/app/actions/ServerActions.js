
import axios from 'axios';

import {
  SERVER_CONNECTING,
  SERVER_CONNECT,
  SERVER_CONNECT_FAIL,
  SERVER_FETCH_PRODUCTS,
  SERVER_DISCONNECT,
  SERVER_SYNC,
  SERVER_SYNCED,
  USER_LOGOUT,
} from '../constants';

import TransactionsActions from './TransactionActions';
import CategoriesActions from './CategoryActions';
import CurrenciesActions from './CurrenciesActions';
import ChangesActions from './ChangeActions';
import UserActions from './UserActions';

const ServerActions = {

  connect: (url) => {
    return (dispatch, getState) => {
      // Default default url in axios
      axios.defaults.baseURL = url;

      dispatch({
        type: SERVER_CONNECTING
      });

      return axios({
        url: '/api/init',
        method: 'get',
      })
        .then(response => {
          const server = response.data;
          server.url = url;
          server.name = url
            .replace('http://', '')
            .replace('https://', '')
            .split(/[/?#]/)[0];

          if (server.name === 'seven23.sebastienbarbier.com') {
            server.isOfficial = true;
          } else {
            server.isOfficial = false;
          }
          dispatch({
            type: SERVER_CONNECT,
            server
          });
          return Promise.resolve(server);
        })
        .catch(function(ex) {

          dispatch({
            type: SERVER_CONNECT_FAIL,
          });
          throw new Error(ex);
        });
    };
  },

  fetchProducts: () => {
    return (dispatch, getState) => {

      return axios({
        url: '/api/init',
        method: 'get',
      })
        .then(response => {
          const server = response.data;
          dispatch({
            type: SERVER_FETCH_PRODUCTS,
            server
          });
          return Promise.resolve(server);
        })
        .catch(function(ex) {
          throw new Error(ex);
        });
    };
  },

  sync: () => {
    return (dispatch, getState) => {
      if (!getState().state.isSyncing) {
        dispatch({
          type: SERVER_SYNC
        });
        return Promise.all([
          dispatch(ServerActions.fetchProducts()),
          dispatch(UserActions.fetchProfile()),
          dispatch(CurrenciesActions.sync()),
          dispatch(CategoriesActions.sync()),
        ]).then(() => {
          return dispatch(ChangesActions.sync());
        }).then(() => {
          return dispatch(TransactionsActions.sync());
        }).then(_ => {
          dispatch({
            type: SERVER_SYNCED
          });
        }).catch(_ => {
          if (getState().state.isLogging) {
            dispatch({
              type: USER_LOGOUT
            });
          }
        });
      }
    };
  },

  disconnect: () => {
    return {
      type: SERVER_DISCONNECT
    };
  }
};

export default ServerActions;