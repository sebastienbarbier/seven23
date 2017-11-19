import dispatcher from '../dispatcher/AppDispatcher';

import axios from 'axios';
import auth from '../auth';

import { EventEmitter } from 'events';

let server = null;

class ServerStore extends EventEmitter {
  constructor() {
    super();
  }

  get server() {
    return server;
  }

  initialize() {
    return axios({
      url: '/api/init',
      method: 'get',
    })
      .then(response => {
        server = response.data;
        server.url = localStorage.getItem('server');
        server.name = localStorage
          .getItem('server')
          .replace('http://', '')
          .replace('https://', '')
          .split(/[/?#]/)[0];
      })
      .catch(function(ex) {
        throw new Error(ex);
      });
  }

  reset() {
    server = null;
    return Promise.resolve();
  }
}

let ServerStoreInstance = new ServerStore();

export default ServerStoreInstance;
