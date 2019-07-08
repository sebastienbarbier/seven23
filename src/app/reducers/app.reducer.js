import {
  NAVIGATE,
  USER_CHANGE_THEME,
  APP_LAST_SEEN,
  RESET
} from "../constants";

const initialState = {
  url: "/",
  last_seen: new Date(),
  theme: "light" // 'dark' or 'light'
};

// Non persisting reducer to store loading animation
function state(state = initialState, action) {
  switch (action.type) {
    case NAVIGATE:
      return Object.assign({}, state, {
        url: action.url
      });
    case APP_LAST_SEEN:
      return Object.assign({}, state, {
        last_seen: new Date()
      });
    case USER_CHANGE_THEME:
      return Object.assign({}, state, {
        theme: action.theme
      });
    case RESET:
      return Object.assign({}, initialState);
    default:
      return state;
  }
}

export default state;
