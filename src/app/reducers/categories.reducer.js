import {
  CATEGORIES_READ_REQUEST,
  CATEGORIES_DELETE_REQUEST,
  ACCOUNTS_SWITCH_REQUEST,
  USER_LOGOUT
} from "../constants";

const initialState = {};

function categories(state = initialState, action) {
  switch (action.type) {
    case CATEGORIES_READ_REQUEST:
      return Object.assign({}, state, {
        list: action.list,
        tree: action.tree
      });
    case ACCOUNTS_SWITCH_REQUEST: {
      return null;
    }
    case USER_LOGOUT:
      return {};
    default:
      return state;
  }
}

export default categories;
