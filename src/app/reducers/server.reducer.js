import {
  SERVER_CONNECT,
  SERVER_DISCONNECT,
  SERVER_SYNC,
  SERVER_SYNCED,
  API_DEFAULT_URL
} from '../constants';

const initialState = {
  url: localStorage.getItem('server') || API_DEFAULT_URL,
};

function server(state = initialState, action) {
  switch (action.type) {
  case SERVER_CONNECT:
    return Object.assign({}, state, action.server);
  case SERVER_DISCONNECT:
    return Object.assign({}, initialState);
  case SERVER_SYNC:
    return Object.assign({}, state, {
      isSyncing: true
    });
  case SERVER_SYNCED:
    return Object.assign({}, state, {
      isSyncing: false
    });
  default:
    return state;
  }
}

export default server;