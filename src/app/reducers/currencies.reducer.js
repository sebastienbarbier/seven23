import { CURRENCIES_SYNC_REQUEST } from '../constants';

const initialState = [];

function currencies(state = initialState, action) {
  switch (action.type) {
  case CURRENCIES_SYNC_REQUEST:
    return Array.from(action.currencies);
  default:
    return state;
  }
}

export default currencies;