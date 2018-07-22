
import {
  ACCOUNTS_SYNC_REQUEST,
  ACCOUNTS_CURRENCY_REQUEST,
  ACCOUNTS_SWITCH_REQUEST,
  USER_LOGOUT,
} from '../constants';

const initialState = null;

function account(state = initialState, action) {
  switch (action.type) {
  case ACCOUNTS_SYNC_REQUEST:
    const account = action.accounts.length ? action.accounts[0] : {};
    return Object.assign({}, state, account);
  case USER_LOGOUT:
    return Object.assign({}, state);
  case ACCOUNTS_SWITCH_REQUEST:
    return Object.assign({}, action.account);
  case ACCOUNTS_CURRENCY_REQUEST:
    return Object.assign({}, state, { currency: action.currency.id });
  default:
    return state;
  }
}

export default account;