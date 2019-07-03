import { NAVIGATE, USER_CHANGE_THEME } from "../constants";

const initialState = {
  url: "/",
  theme: "light" // 'dark' or 'light'
};

// Non persisting reducer to store loading animation
function state(state = initialState, action) {
  switch (action.type) {
    case NAVIGATE:
      return Object.assign({}, state, {
        url: action.url
      });
    case USER_CHANGE_THEME:
      return Object.assign({}, state, {
        theme: action.theme
      });
    default:
      return state;
  }
}

export default state;
