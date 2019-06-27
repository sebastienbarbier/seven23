import { CURRENCIES_SYNC_REQUEST, USER_LOGOUT } from "../constants";

const initialState = [];

function currencies(state = initialState, action) {
  switch (action.type) {
    case CURRENCIES_SYNC_REQUEST:
      return Array.from(action.currencies);
    case USER_LOGOUT:
      return Object.assign({}, initialState);
    default:
      return state;
  }
}

export default currencies;
