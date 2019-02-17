
import axios from 'axios';

import {
  SERVER_CONNECTING,
  SERVER_CONNECT,
  SERVER_DISCONNECT,
  SERVER_SYNC,
  SERVER_SYNCED,
  SERVER_LOGGED,
  USER_LOGOUT,
} from '../constants';

import TransactionsActions from './TransactionActions';
import CategoriesActions from './CategoryActions';
import CurrenciesActions from './CurrenciesActions';
import ChangesActions from './ChangeActions';
import GoalActions from './GoalActions';

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
          dispatch(CurrenciesActions.sync()),
          dispatch(CategoriesActions.sync()),
        ]).then(() => {
          return dispatch(ChangesActions.sync());
        }).then(() => {
          return dispatch(GoalActions.sync());
        }).then(() => {
          return dispatch(TransactionsActions.sync());
        }).then(_ => {
          dispatch({
            type: SERVER_LOGGED
          });
          dispatch({
            type: SERVER_SYNCED
          });
        }).catch(_ => {
          if (getState().user.isLogging) {
            dispatch({
              type: USER_LOGOUT
            });
          }
        });
      }
    };
  },

  log_without_sync: () => {

    return (dispatch, getState) => {
      dispatch({
        type: SERVER_LOGGED
      });
      dispatch({
        type: SERVER_SYNCED
      });
    };
  },

  disconnect: () => {
    return {
      type: SERVER_DISCONNECT
    };
  }
};

export default ServerActions;