import {
  CHANGES_READ_REQUEST,
  ACCOUNTS_SWITCH_REQUEST,
  ACCOUNTS_CURRENCY_REQUEST,
  USER_LOGOUT,
  RESET,
} from "../constants";

const initialState = null;

function changes(state = initialState, action) {
  switch (action.type) {
    case CHANGES_READ_REQUEST:
      return Object.assign({}, state, {
        list: action.list.sort((a, b) => (a.date < b.date ? 1 : -1)),
        chain: action.chain,
      });
    case ACCOUNTS_SWITCH_REQUEST: {
      return null;
    }
    case ACCOUNTS_CURRENCY_REQUEST: {
      return null;
    }
    case RESET:
      return Object.assign({}, initialState);
    default:
      return state;
  }
}

export default changes;
