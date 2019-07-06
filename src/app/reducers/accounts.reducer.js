import {
  USER_FETCH_TOKEN,
  USER_FETCH_PROFILE,
  USER_UPDATE_REQUEST,
  USER_LOGOUT,
  ACCOUNTS_CURRENCY_REQUEST,
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
      if (action.account.isLocal) {
        const accounts = Array.from(state.local);
        accounts.push(action.account);
        return Object.assign({}, state, {
          local: accounts
        });
      } else {
        const accounts = Array.from(state.remote);
        accounts.push(action.account);
        return Object.assign({}, state, {
          remote: accounts
        });
      }
    }
    case ACCOUNTS_UPDATE_REQUEST: {
      if (action.account.isLocal) {
        const accounts = Array.from(
          state.local.filter(account => {
            return account.id !== action.account.id;
          })
        );
        accounts.push(action.account);
        return Object.assign({}, state, {
          local: accounts
        });
      } else {
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
    }
    case ACCOUNTS_DELETE_REQUEST: {
      if (action.account && action.account.isLocal) {
        const accounts = Array.from(
          state.local.filter(account => {
            return account.id !== action.account.id;
          })
        );
        return Object.assign({}, state, {
          local: accounts
        });
      } else if (action.account && !action.account.isLocal) {
        const accounts = Array.from(
          state.remote.filter(account => {
            return account.id !== action.account.id;
          })
        );
        return Object.assign({}, state, {
          remote: accounts
        });
      } else {
        return state;
      }
    }
    case USER_LOGOUT:
      return Object.assign({}, state, {
        remote: []
      });
    case ACCOUNTS_SYNC_REQUEST:
      return Object.assign({}, state, {
        remote: action.accounts
      });
    default:
      return state;
  }
}

export default accounts;
