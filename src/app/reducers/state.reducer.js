import {
  ACCOUNTS_CURRENCY_REQUEST,
  ACCOUNTS_SWITCH_REQUEST,
  CACHE_DID_UPDATE,
  FLOATING_ADD_BUTTON,
  HIDE_NAV_BAR,
  MODAL,
  NAV_BAR,
  RESET,
  SERVER_CONNECT,
  SERVER_CONNECTING,
  SERVER_CONNECT_FAIL,
  SERVER_ERROR,
  SERVER_LOAD,
  SERVER_LOADED,
  SERVER_SYNC,
  SERVER_SYNCED,
  SERVER_UNDER_MAINTENANCE,
  SNACKBAR,
  SNACKBAR_POP,
  USER_LOGIN,
  USER_LOGOUT,
  USER_LOGOUT_LOADING,
} from "../constants";

const initialState = {
  isSyncing: false,
  isLoading: false,
  isServerLoading: false,
  isConnecting: false,
  isLogging: false,
  isLogout: false,
  cacheDidUpdate: false,
  snackbars: [],
  modal: null,
  fab: null,
  navbar: {
    title: "",
    next: null,
    back: null,
    height: 0,
  },
  navbarIsHidden: false,
};

// Non persisting reducer to store loading animation
function state(state = initialState, action) {
  switch (action.type) {
    case CACHE_DID_UPDATE:
      return Object.assign({}, state, {
        cacheDidUpdate: action?.value == false ? action.value : true,
      });
    case USER_LOGIN:
      return Object.assign({}, state, {
        isLogging: false,
      });
    case SERVER_CONNECTING:
      return Object.assign({}, state, {
        isConnecting: true,
      });
    case SERVER_CONNECT:
      return Object.assign({}, state, {
        isConnecting: false,
      });
    case SERVER_CONNECT_FAIL:
      return Object.assign({}, state, {
        isConnecting: false,
      });
    case SERVER_SYNC:
      return Object.assign({}, state, {
        isSyncing: true,
        isLoading: true,
      });
    case SERVER_SYNCED: {
      return Object.assign({}, state, {
        isSyncing: false,
        isLoading: false,
      });
    }
    case SERVER_LOAD: {
      return Object.assign({}, state, {
        isLoading: true,
      });
    }
    case SERVER_LOADED: {
      return Object.assign({}, state, {
        isLoading: false,
      });
    }
    case USER_LOGOUT_LOADING: {
      const res = Object.assign({}, state);
      res.isLogout = true;
      return res;
    }
    case USER_LOGOUT:
      return Object.assign({}, state, {
        isSyncing: false,
        isLoading: false,
        isLogout: false,
      });
    case ACCOUNTS_CURRENCY_REQUEST:
      return Object.assign({}, state, {
        isLoading: true,
      });
    case ACCOUNTS_SWITCH_REQUEST:
      return Object.assign({}, state, {
        isLoading: true,
      });
    case MODAL: {
      const res = Object.assign({}, state);
      res.modal = action.modal;
      return res;
    }
    case HIDE_NAV_BAR: {
      const res = Object.assign({}, state);
      res.navbarIsHidden = action.isHidden;
      return res;
    }
    case NAV_BAR: {
      const res = Object.assign({}, state);
      res.navbar = {
        title: action.title,
        next: action.next,
        back: action.back,
        height: action.height,
      };
      return res;
    }
    case FLOATING_ADD_BUTTON: {
      const res = Object.assign({}, state);
      res.fab = action.fab;
      return res;
    }
    case SNACKBAR: {
      const res = Object.assign({}, state);
      res.snackbars = state.snackbars.map((a) => ({ ...a }));
      res.snackbars.push(action.snackbar);
      return res;
    }
    case SNACKBAR_POP: {
      const res = Object.assign({}, state);
      res.snackbars = state.snackbars.map((a) => ({ ...a }));
      res.snackbars.pop();
      return res;
    }
    case SERVER_UNDER_MAINTENANCE:
      return Object.assign({}, state, {
        isSyncing: false,
        isLoading: false,
      });
    case SERVER_ERROR:
      return Object.assign({}, state, {
        isSyncing: false,
        isLoading: false,
      });
    case RESET:
      return Object.assign({}, initialState);
    default:
      return state;
  }
}

export default state;
