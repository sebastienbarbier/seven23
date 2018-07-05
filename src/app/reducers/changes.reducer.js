import {
  CHANGES_READ_REQUEST,
} from '../constants';

const initialState = {};

function changes(state = initialState, action) {
  switch (action.type) {
  case CHANGES_READ_REQUEST:
    return Object.assign({}, state, {
      list: action.list,
      chain: action.chain,
    });
  default:
    return state;
  }
}

export default changes;