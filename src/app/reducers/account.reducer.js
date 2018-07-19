
import {
  ACCOUNTS_SYNC_REQUEST,
  ACCOUNTS_CURRENCY_REQUEST,
  USER_LOGOUT,
} from '../constants';

const initialState = null;

function account(state = initialState, action) {
  switch (action.type) {
  case ACCOUNTS_SYNC_REQUEST:
    return Object.assign({}, state || action.accounts[0]);
  case USER_LOGOUT:
    return Object.assign({}, state);
  case ACCOUNTS_CURRENCY_REQUEST:
    return Object.assign({}, state, { currency: action.currency.id });
  default:
    return state;
  }
}

export default account;