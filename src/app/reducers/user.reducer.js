
import {
  // USER_LOGIN,
  // USER_LOGOUT,
  // USER_UPDATE_REQUEST,
  // USER_DELETE_REQUEST,
  // USER_CHANGE_PASSWORD,
  // USER_CHANGE_EMAIL,
  // USER_REVOKE_TOKEN,
  USER_CHANGE_THEME,
} from '../constants';

const initialState = {
  theme: localStorage.getItem('theme') || 'light', // 'dark' or 'light'
  token: localStorage.getItem('token'),
};

function user(state = initialState, action) {
  switch (action.type) {
  case USER_CHANGE_THEME:
    return Object.assign({}, state, {
      theme: action.theme
    });
  default:
    return state;
  }
}

export default user;