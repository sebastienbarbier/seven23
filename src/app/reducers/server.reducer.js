import {
  SERVER_CONNECT,
  SERVER_DISCONNECT,
  SERVER_SYNC,
  SERVER_SYNCED,
  SERVER_LOGGED,
  API_DEFAULT_URL,
  USER_LOGOUT,
  ACCOUNTS_CURRENCY_REQUEST,
  ACCOUNTS_SWITCH_REQUEST,
  SERVER_LAST_EDITED,
} from '../constants';

const url = localStorage.getItem('server') || API_DEFAULT_URL;
const name = url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];
const last_sync = new Date(localStorage.getItem('last_sync'));

const initialState = {
  url,
  name,
  last_sync,
  isSyncing: false,
  isLogged: false
};

function server(state = initialState, action) {
  switch (action.type) {
  case SERVER_CONNECT:
    return Object.assign({}, state, action.server);
  case SERVER_DISCONNECT:
    return Object.assign({}, initialState, { url: null, name: null });
  case SERVER_SYNC:
    return Object.assign({}, state, {
      isSyncing: true
    });
  case SERVER_SYNCED:
    return Object.assign({}, state, {
      isSyncing: false,
    });
  case SERVER_LOGGED:
    return Object.assign({}, state, {
      isLogged: true
    });
  case SERVER_LAST_EDITED: {
    if (!state.last_sync) {
      localStorage.setItem('last_sync', action.last_edited);
      return Object.assign({}, state, {
        last_sync: action.last_edited
      });
    } else {

      const last_sync = action.last_edited && state.last_sync < action.last_edited ?
          action.last_edited : state.last_sync;

      localStorage.setItem('last_sync', last_sync);

      return Object.assign({}, state, {
        last_sync
      });
    }

  }
  case USER_LOGOUT:
    return Object.assign({}, state, {
      isLogged: false,
      isSyncing: false,
      last_sync: null,
    });
  case ACCOUNTS_CURRENCY_REQUEST:
    return Object.assign({}, state, {
      isSyncing: true
    });
  case ACCOUNTS_SWITCH_REQUEST:
    return Object.assign({}, state, {
      isSyncing: true
    });
  default:
    return state;
  }
}

export default server;