
import {
  USER_FETCH_TOKEN,
  USER_CHANGE_THEME,
  USER_FETCH_PROFILE,
  USER_UPDATE_REQUEST,
  USER_LOGOUT,
  ACCOUNTS_SYNC_REQUEST,
  ACCOUNTS_CREATE_REQUEST,
  ACCOUNTS_UPDATE_REQUEST,
  ACCOUNTS_DELETE_REQUEST,
  TRANSACTIONS_CREATE_REQUEST,
  TRANSACTIONS_UPDATE_REQUEST,
  // Update UI during login status
  USER_START_LOGIN,
  USER_UPDATE_LOGIN,
  USER_STOP_LOGIN,
} from '../constants';

const initialState = {
  accounts: [],
  theme: 'light', // 'dark' or 'light'
  token: null,
  cipher: null,
  lastCurrencyUsed: null,
  isLogging: null,
};

function user(state = initialState, action) {
  switch (action.type) {
  case USER_START_LOGIN:
    return Object.assign({}, state, {
      isLogging: {
        dateBegin: new Date(),
      }
    });
  case USER_UPDATE_LOGIN:
    return Object.assign({}, state, {
      isLogging: action.isLogging
    });
  case USER_STOP_LOGIN:
    return Object.assign({}, state, {
      isLogging: null
    });
  case USER_CHANGE_THEME:
    return Object.assign({}, state, {
      theme: action.theme
    });
  case USER_FETCH_TOKEN:
    return Object.assign({}, state, {
      token: action.token,
      cipher: action.cipher,
      profile: null
    });
  case USER_FETCH_PROFILE:
    return Object.assign({}, state, {
      profile: action.profile
    });
  case USER_UPDATE_REQUEST:
    return Object.assign({}, state, {
      profile: action.profile
    });
  case ACCOUNTS_CREATE_REQUEST: {
    const accounts = Array.from(state.accounts);
    accounts.push(action.account);
    return Object.assign({}, state, {
      accounts,
      lastCurrencyUsed: action.account.currency
    });
  }
  case ACCOUNTS_UPDATE_REQUEST: {
    const accounts = Array.from(state.accounts.filter(account => {
      return account.id !== action.account.id;
    }));
    accounts.push(action.account);
    return Object.assign({}, state, {
      accounts
    });
  }
  case ACCOUNTS_DELETE_REQUEST: {
    const accounts = Array.from(state.accounts.filter(account => {
      return account.id !== action.id;
    }));
    return Object.assign({}, state, {
      accounts
    });
  }
  case USER_LOGOUT:
    return Object.assign({}, initialState, {
      token: null,
      cipher: null,
    });
  case ACCOUNTS_SYNC_REQUEST:
    return Object.assign({}, state, {
      accounts: action.accounts,
      lastCurrencyUsed: state.lastCurrencyUsed || (action.accounts.length ? action.accounts[0].currency : null)
    });
  case TRANSACTIONS_CREATE_REQUEST: {
    return Object.assign({}, state, {
      lastCurrencyUsed: action.transaction.originalCurrency
    });
  }
  case TRANSACTIONS_UPDATE_REQUEST: {
    return Object.assign({}, state, {
      lastCurrencyUsed: action.transaction.originalCurrency
    });
  }
  default:
    return state;
  }
}

export default user;