import {
  SERVER_CONNECT,
  SERVER_DISCONNECT,
  SERVER_SYNC,
  SERVER_SYNCED,
  SERVER_LOGGED,
  API_DEFAULT_URL,
  USER_LOGOUT,
  ACCOUNTS_CURRENCY_REQUEST
} from '../constants';

const initialState = {
  url: localStorage.getItem('server') || API_DEFAULT_URL,
  isSyncing: false,
  isLogged: false
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
  case SERVER_LOGGED:
    return Object.assign({}, state, {
      isLogged: true
    });
  case USER_LOGOUT:
    return Object.assign({}, state, {
      isLogged: false,
      isSyncing: false
    });
  case ACCOUNTS_CURRENCY_REQUEST:
    return Object.assign({}, state, {
      isSyncing: true
    });
  default:
    return state;
  }
}

export default server;