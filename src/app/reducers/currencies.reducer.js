import { CURRENCIES_SYNC_REQUEST, USER_LOGOUT } from "../constants";

import fixtures_currencies from "../fixtures/currencies";

const initialState = Array.from(fixtures_currencies).sort((a, b) =>
  a.name > b.name ? 1 : -1
);

function currencies(state = initialState, action) {
  switch (action.type) {
    case CURRENCIES_SYNC_REQUEST:
      return Array.from(action.currencies);
    case USER_LOGOUT:
      return Array.from(initialState);
    default:
      return state;
  }
}

export default currencies;
