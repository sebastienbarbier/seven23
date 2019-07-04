import {
  USER_FETCH_TOKEN,
  USER_FETCH_PROFILE,
  USER_UPDATE_REQUEST,
  USER_LOGOUT,
  ACCOUNTS_SYNC_REQUEST,
  ACCOUNTS_CREATE_REQUEST,
  ACCOUNTS_UPDATE_REQUEST,
  ACCOUNTS_DELETE_REQUEST
} from "../constants";

const initialState = {
  local: [], // local accounts are stored on device only
  remote: []
};

function accounts(state = initialState, action) {
  switch (action.type) {
    case ACCOUNTS_CREATE_REQUEST: {
      const accounts = Array.from(state.remote);
      accounts.push(action.account);
      return Object.assign({}, state, {
        remote: accounts
      });
    }
    case ACCOUNTS_UPDATE_REQUEST: {
      const accounts = Array.from(
        state.remote.filter(account => {
          return account.id !== action.account.id;
        })
      );
      accounts.push(action.account);
      return Object.assign({}, state, {
        remote: accounts
      });
    }
    case ACCOUNTS_DELETE_REQUEST: {
      const accounts = Array.from(
        state.remote.filter(account => {
          return account.id !== action.id;
        })
      );
      return Object.assign({}, state, {
        remote: accounts
      });
    }
    case USER_LOGOUT:
      return Object.assign({}, initialState);
    case ACCOUNTS_SYNC_REQUEST:
      return Object.assign({}, state, {
        remote: action.accounts
      });
    default:
      return state;
  }
}

export default accounts;
