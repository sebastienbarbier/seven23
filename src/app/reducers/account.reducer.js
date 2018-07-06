
import {
  ACCOUNTS_SYNC_REQUEST,
  USER_LOGOUT,
} from '../constants';

const initialState = null;

function account(state = initialState, action) {
  switch (action.type) {
  case ACCOUNTS_SYNC_REQUEST:
    return Object.assign({}, initialState || action.accounts[0]);
  case USER_LOGOUT:
    return Object.assign({}, initialState);
  default:
    return state;
  }
}

export default account;