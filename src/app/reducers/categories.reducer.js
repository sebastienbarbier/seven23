import {
  ACCOUNTS_SWITCH_REQUEST,
  CATEGORIES_READ_REQUEST,
  RESET,
} from "../constants";

const initialState = {};

function categories(state = initialState, action) {
  switch (action.type) {
    case CATEGORIES_READ_REQUEST:
      return Object.assign({}, state, {
        list: action.list,
        tree: action.tree,
      });
    case ACCOUNTS_SWITCH_REQUEST: {
      return null;
    }
    case RESET:
      return Object.assign({}, initialState);
    default:
      return state;
  }
}

export default categories;
