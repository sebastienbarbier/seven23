import {
  SERVER_CONNECTING,
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

let last_edited = localStorage.getItem('last_edited');
if (last_edited && last_edited != 'null' && last_edited != 'undefined') {
  last_edited = localStorage.getItem('last_edited');
} else {
  last_edited = null;
}

const initialState = {
  url,
  name,
  last_edited,
  isSyncing: false,
  isLogged: false,
  isConnecting: false,
};

function server(state = initialState, action) {
  switch (action.type) {
  case SERVER_CONNECTING:
    return Object.assign({}, state, { isConnecting: true });
  case SERVER_CONNECT:
    return Object.assign({}, state, action.server, { isConnecting: false });
  case SERVER_DISCONNECT:
    return Object.assign({}, initialState, { url: null, name: null });
  case SERVER_SYNC:
    return Object.assign({}, state, {
      isSyncing: true
    });
  case SERVER_SYNCED:
    localStorage.setItem('last_edited', state.last_edited_tmp);
    return Object.assign({}, state, {
      isSyncing: false,
      last_edited: state.last_edited_tmp,
    });
  case SERVER_LOGGED:
    return Object.assign({}, state, {
      isLogged: true
    });
  case SERVER_LAST_EDITED: {
    console.log(action.last_edited);
    let last_edited_tmp;
    if (!state.last_edited_tmp) {
      last_edited_tmp = action.last_edited;
    } else {
      last_edited_tmp = state.last_edited_tmp < action.last_edited ?
        action.last_edited : state.last_edited_tmp;
    }
    return Object.assign({}, state, {
      last_edited_tmp
    });
  }
  case USER_LOGOUT:
    return Object.assign({}, state, {
      isLogged: false,
      isSyncing: false,
      last_edited: null,
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