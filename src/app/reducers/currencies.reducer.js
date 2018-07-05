const initialState = {};

import { CURRENCIES_SYNC_REQUEST } from '../constants';

function currencies(state = initialState, action) {
  switch (action.type) {
  case CURRENCIES_SYNC_REQUEST:
    return new Array(action.currencies);
  default:
    return state;
  }
}

export default currencies;