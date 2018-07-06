
import {
  USER_FETCH_TOKEN,
  USER_CHANGE_THEME,
  USER_FETCH_PROFILE,
  ACCOUNTS_SYNC_REQUEST,
  USER_LOGOUT,
} from '../constants';

const initialState = {
  accounts: [],
  theme: localStorage.getItem('theme') || 'light', // 'dark' or 'light'
  token: localStorage.getItem('token'),
};

function user(state = initialState, action) {
  switch (action.type) {
  case USER_CHANGE_THEME:
    return Object.assign({}, state, {
      theme: action.theme
    });
  case USER_FETCH_TOKEN:
    return Object.assign({}, state, {
      token: action.token,
      profile: null
    });
  case USER_FETCH_PROFILE:
    return Object.assign({}, state, {
      profile: action.profile
    });
  case USER_LOGOUT:
    return Object.assign({}, initialState, {
      token: null
    });
  case ACCOUNTS_SYNC_REQUEST:
    return Object.assign({}, state, {
      accounts: action.accounts
    });
  default:
    return state;
  }
}

export default user;