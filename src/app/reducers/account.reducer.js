import {
  TRANSACTIONS_READ_REQUEST,
  ACCOUNTS_CURRENCY_REQUEST,
  ACCOUNTS_SWITCH_REQUEST,
  ACCOUNTS_SYNC_REQUEST,
  ACCOUNTS_CREATE_REQUEST,
  ACCOUNTS_UPDATE_REQUEST,
  ACCOUNTS_DELETE_REQUEST,
  USER_LOGOUT
} from "../constants";

const initialState = null;

function account(state = initialState, action) {
  switch (action.type) {
    case ACCOUNTS_SYNC_REQUEST:
      if (!state || !state.id) {
        return Object.assign(
          {},
          state,
          action.accounts.length ? action.accounts[0] : {}
        );
      }
      return Object.assign({}, state);
    case ACCOUNTS_UPDATE_REQUEST: {
      if (state.id == action.account.id) {
        return Object.assign({}, action.account);
      }
      return Object.assign({}, state);
    }
    case ACCOUNTS_CREATE_REQUEST: {
      if (!state || !state.id) {
        return Object.assign({}, action.account);
      } else {
        return Object.assign({}, state);
      }
    }
    case ACCOUNTS_DELETE_REQUEST: {
      if (state && state.id === action.id) {
        return Object.assign({}, action.account);
      } else {
        return Object.assign({}, state);
      }
    }
    case USER_LOGOUT:
      return null;
    case ACCOUNTS_SWITCH_REQUEST:
      return Object.assign({}, action.account);
    case ACCOUNTS_CURRENCY_REQUEST:
      return Object.assign({}, state, { currency: action.currency.id });
    case TRANSACTIONS_READ_REQUEST:
      return Object.assign({}, state, {
        youngest: action.youngest,
        oldest: action.oldest
      });
    default:
      return state;
  }
}

export default account;
