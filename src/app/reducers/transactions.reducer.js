import {
  TRANSACTIONS_READ_REQUEST,
} from '../constants';

const initialState = {};

function transactions(state = initialState, action) {
  switch (action.type) {
  case TRANSACTIONS_READ_REQUEST:
    return Object.assign({}, state, {
      dateBegin: action.dateBegin,
      dateEnd: action.dateEnd,
      trend: action.trend,
      currentYear: action.currentYear,
      stats: action.stats,
      transactions: action.transactions,
    });
  default:
    return state;
  }
}

export default transactions;