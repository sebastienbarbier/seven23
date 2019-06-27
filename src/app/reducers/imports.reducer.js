import { ACCOUNTS_IMPORT_UPDATE, USER_LOGOUT } from "../constants";

const initialState = {};

function imports(state = initialState, action) {
  switch (action.type) {
    case ACCOUNTS_IMPORT_UPDATE:
      if (action.progress >= 100) {
        return {};
      } else if (
        (!state.progress && action.progress) ||
        action.progress > state.progress
      ) {
        return Object.assign({}, state, {
          progress: action.progress
        });
      }
      return Object.assign({}, state);
    case USER_LOGOUT:
      return {
        progress: null
      };
    default:
      return state;
  }
}

export default imports;
