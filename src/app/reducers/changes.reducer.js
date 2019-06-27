import { CHANGES_READ_REQUEST, USER_LOGOUT } from "../constants";

const initialState = {};

function changes(state = initialState, action) {
  switch (action.type) {
    case CHANGES_READ_REQUEST:
      return Object.assign({}, state, {
        list: action.list.sort((a, b) => (a.date < b.date ? 1 : -1)),
        chain: action.chain
      });
    case USER_LOGOUT:
      return Object.assign({}, initialState);
    default:
      return state;
  }
}

export default changes;
