
import axios from 'axios';

import {
  SERVER_CONNECT
} from '../constants';

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
          server.url = localStorage.getItem('server');
          server.name = localStorage
            .getItem('server')
            .replace('http://', '')
            .replace('https://', '')
            .split(/[/?#]/)[0];

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

  disconnect: () => {
    return {
      type: SERVER_CONNECT,
      server: {}
    };
  }
};

export default ServerActions;
