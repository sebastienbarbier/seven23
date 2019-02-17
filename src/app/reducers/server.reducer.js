import {
  SERVER_DISCONNECT,
  SERVER_SYNCED,
  SERVER_LOGGED,
  API_DEFAULT_URL,
  USER_LOGOUT,
  SERVER_LAST_EDITED,
} from '../constants';

const url = API_DEFAULT_URL;
const name = url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];

const initialState = {
  url,
  name,
  isLogged: false,
};

function server(state = initialState, action) {
  switch (action.type) {
  case SERVER_DISCONNECT:
    return Object.assign({}, initialState, { url: null, name: null });
  case SERVER_SYNCED: {
    const last_sync = new Date().toISOString();
    return Object.assign({}, state, {
      last_sync: last_sync,
      last_edited: state.last_edited_tmp,
    });
  }
  case SERVER_LOGGED:
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