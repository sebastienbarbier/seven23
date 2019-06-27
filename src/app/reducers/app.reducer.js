import { NAVIGATE } from "../constants";

const initialState = {
  url: "/"
};

// Non persisting reducer to store loading animation
function state(state = initialState, action) {
  switch (action.type) {
    case NAVIGATE:
      return Object.assign({}, state, {
        url: action.url
      });
    default:
      return state;
  }
}

export default state;
