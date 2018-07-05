
import {
  ACCOUNTS_SYNC_REQUEST,
} from '../constants';

const initialState = null;

function account(state = initialState, action) {
  switch (action.type) {
  case ACCOUNTS_SYNC_REQUEST:
    return Object.assign({}, initialState || action.accounts[0]);
  default:
    return state;
  }
}

export default account;