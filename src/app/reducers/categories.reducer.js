import {
  CATEGORIES_READ_REQUEST,
} from '../constants';

const initialState = {};

function categories(state = initialState, action) {
  switch (action.type) {
  case CATEGORIES_READ_REQUEST:
    return Object.assign({}, state, {
      list: action.list,
      tree: action.tree
    });
  default:
    return state;
  }
}

export default categories;