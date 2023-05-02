import {
  NAVIGATE,
  USER_CHANGE_THEME,
  APP_LAST_SEEN,
  RESET,
  VISIBILITY,
  TOGGLE_DEVELOPER,
} from "../constants";

const initialState = {
  url: "/",
  last_seen: new Date(),
  isConfidential: false,
  isDeveloper: false,
  theme: "light", // 'dark' or 'light'
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
    case TOGGLE_DEVELOPER:
      return Object.assign({}, state, {
        isDeveloper: !state.isDeveloper
      });
    case RESET:
      return Object.assign({}, initialState);
    case VISIBILITY:
      return Object.assign({}, state, {
        isConfidential: action.isConfidential
      });
    default:
      return state;
  }
}

export default state;