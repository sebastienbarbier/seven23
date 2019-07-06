import { CURRENCIES_SYNC_REQUEST, USER_LOGOUT } from "../constants";

import fixtures_currencies from "../fixtures/currencies";

const initialState = Array.from(fixtures_currencies);

function currencies(state = initialState, action) {
  switch (action.type) {
    case CURRENCIES_SYNC_REQUEST:
      return Array.from(action.currencies);
    case USER_LOGOUT:
      return Array.from(fixtures_currencies);
    default:
      return state;
  }
}

export default currencies;
