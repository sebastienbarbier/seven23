
import axios from 'axios';

import {
  SERVER_CONNECT,
  SERVER_DISCONNECT,
  SERVER_SYNC,
  SERVER_SYNCED,
  SERVER_LOGGED,
} from '../constants';

import TransactionsActions from './TransactionActions';
import CategoriesActions from './CategoryActions';
import CurrenciesActions from './CurrenciesActions';
import ChangesActions from './ChangeActions';

const ServerActions = {

  connect: (url) => {
    return (dispatch, getState) => {
      // Default default url in axios
      axios.defaults.baseURL = url;

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

          localStorage.setItem('server', url);

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
      if (!getState().server.isSyncing) {
        dispatch({
          type: SERVER_SYNC
        });
        return Promise.all([
          dispatch(CurrenciesActions.sync()),
          dispatch(CategoriesActions.sync()),
        ]).then(() => {
          return ChangesActions.sync();
        }).then(() => {
          return dispatch(TransactionsActions.sync());
        }).then(_ => {
          dispatch({
            type: SERVER_LOGGED
          });
          dispatch({
            type: SERVER_SYNCED
          });
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
