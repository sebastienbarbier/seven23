import {
  SERVER_CONNECTING,
  SERVER_CONNECT,
  SERVER_SYNC,
  SERVER_SYNCED,
  USER_LOGOUT,
  ACCOUNTS_CURRENCY_REQUEST,
  ACCOUNTS_SWITCH_REQUEST,
} from '../constants';

const initialState = {
  isSyncing: false,
  isConnecting: false,
};

// Non persisting reducer to store loading animation
function state(state = initialState, action) {
  switch (action.type) {
  case SERVER_CONNECTING:
    return Object.assign({}, state, {
      isConnecting: true
    });
  case SERVER_CONNECT:
    return Object.assign({}, state, {
      isConnecting: false
    });
  case SERVER_SYNC:
    return Object.assign({}, state, {
      isSyncing: true
    });
  case SERVER_SYNCED: {
    return Object.assign({}, state, {
      isSyncing: false,
    });
  }
  case USER_LOGOUT:
    return Object.assign({}, state, {
      isSyncing: false,
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

export default state;