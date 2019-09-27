import {
  USER_FETCH_TOKEN,
  USER_FETCH_PROFILE,
  USER_UPDATE_REQUEST,
  USER_LOGOUT,
  USER_UPDATE_NETWORK,
  ACCOUNTS_SYNC_REQUEST,
  ACCOUNTS_CREATE_REQUEST,
  TRANSACTIONS_CREATE_REQUEST,
  TRANSACTIONS_UPDATE_REQUEST,
  // Update UI during login status
  UPDATE_ENCRYPTION,
  RESET
} from "../constants";

const initialState = {
  token: null,
  cipher: null,
  lastCurrencyUsed: null,
  socialNetworks: {},
  profile: null
};

function user(state = initialState, action) {
  switch (action.type) {
    case USER_FETCH_TOKEN:
      return Object.assign({}, state, {
        token: action.token,
        cipher: action.cipher,
        profile: null
      });
    case UPDATE_ENCRYPTION:
      return Object.assign({}, state, {
        cipher: action.cipher
      });
    case USER_FETCH_PROFILE:
      const profile = Object.assign({}, action.profile);
      delete profile.social_networks;
      return Object.assign({}, state, {
        profile,
        socialNetworks: action.profile.social_networks || {}
      });
    case USER_UPDATE_REQUEST:
      return Object.assign({}, state, {
        profile: action.profile
      });
    case ACCOUNTS_CREATE_REQUEST: {
      return Object.assign({}, state, {
        lastCurrencyUsed: action.account.currency
      });
    }
    case USER_LOGOUT:
      return Object.assign({}, initialState, {
        token: null,
        cipher: null,
        profile: null
      });
    case ACCOUNTS_SYNC_REQUEST:
      return Object.assign({}, state, {
        lastCurrencyUsed:
          state.lastCurrencyUsed ||
          (action.accounts.length ? action.accounts[0].currency : null)
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
    case USER_UPDATE_NETWORK: {
      return Object.assign({}, state, {
        socialNetworks: Object.assign(
          {},
          state.socialNetworks,
          action.socialNetworks
        )
      });
    }
    case RESET:
      return Object.assign({}, initialState);
    default:
      return state;
  }
}

export default user;
