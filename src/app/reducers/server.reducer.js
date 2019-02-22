import {
  SERVER_DISCONNECT,
  SERVER_SYNCED,
  USER_LOGIN,
  API_DEFAULT_URL,
  SERVER_CONNECT,
  SERVER_CONNECT_FAIL,
  USER_LOGOUT,
  SERVER_LAST_EDITED,
} from '../constants';

const url = API_DEFAULT_URL;
const name = url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];

const initialState = {
  url,
  name,
  isLogged: false,
  isConnected: false,
};

function server(state = initialState, action) {
  switch (action.type) {
  case SERVER_CONNECT:
    return Object.assign({}, initialState, action.server, { isConnected: true });
  case SERVER_CONNECT_FAIL:
    return Object.assign({}, initialState, action.server, { isConnected: false });
  case SERVER_DISCONNECT:
    return Object.assign({}, initialState, { url: null, name: null, isConnected: false });
  case SERVER_SYNCED: {
    const last_sync = new Date().toISOString();
    return Object.assign({}, state, {
      last_sync: last_sync,
      last_edited: state.last_edited_tmp,
    });
  }
  case USER_LOGIN:
    return Object.assign({}, state, {
      isLogged: true
    });
  case SERVER_LAST_EDITED: {
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
      last_edited: null,
    });
  default:
    return state;
  }
}

export default server;