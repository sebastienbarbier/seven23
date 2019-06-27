import {
  SERVER_CONNECTING,
  SERVER_CONNECT,
  SERVER_CONNECT_FAIL,
  SERVER_SYNC,
  SERVER_SYNCED,
  USER_LOGOUT,
  ACCOUNTS_CURRENCY_REQUEST,
  ACCOUNTS_SWITCH_REQUEST,
  USER_START_LOGIN,
  USER_STOP_LOGIN,
  USER_LOGIN,
  SERVER_LOADED,
  SERVER_UNDER_MAINTENANCE,
  SERVER_ERROR,
  SNACKBAR
} from "../constants";

const initialState = {
  isSyncing: false,
  isLoading: false,
  isConnecting: false,
  isLogging: false,
  snackbars: []
};

// Non persisting reducer to store loading animation
function state(state = initialState, action) {
  switch (action.type) {
    case USER_START_LOGIN:
      return Object.assign({}, state, {
        isLogging: true
      });
    case USER_STOP_LOGIN:
      return Object.assign({}, state, {
        isLogging: false
      });
    case USER_LOGIN:
      return Object.assign({}, state, {
        isLogging: false
      });
    case SERVER_CONNECTING:
      return Object.assign({}, state, {
        isConnecting: true
      });
    case SERVER_CONNECT:
      return Object.assign({}, state, {
        isConnecting: false
      });
    case SERVER_CONNECT_FAIL:
      return Object.assign({}, state, {
        isConnecting: false
      });
    case SERVER_SYNC:
      return Object.assign({}, state, {
        isSyncing: true,
        isLoading: true
      });
    case SERVER_SYNCED: {
      return Object.assign({}, state, {
        isSyncing: false,
        isLoading: false
      });
    }
    case SERVER_LOADED: {
      return Object.assign({}, state, {
        isLoading: false
      });
    }
    case USER_LOGOUT:
      return Object.assign({}, state, {
        isSyncing: false,
        isLoading: false
      });
    case ACCOUNTS_CURRENCY_REQUEST:
      return Object.assign({}, state, {
        isLoading: true
      });
    case ACCOUNTS_SWITCH_REQUEST:
      return Object.assign({}, state, {
        isLoading: true
      });
    case SNACKBAR: {
      const res = Object.assign({}, state);
      res.snackbars = state.snackbars.map(a => ({ ...a }));
      res.snackbars.push(action.snackbar);
      return res;
    }
    case SERVER_UNDER_MAINTENANCE:
      return Object.assign({}, state, {
        isSyncing: false,
        isLoading: false
      });
    case SERVER_ERROR:
      return Object.assign({}, state, {
        isSyncing: false,
        isLoading: false
      });
    default:
      return state;
  }
}

export default state;
