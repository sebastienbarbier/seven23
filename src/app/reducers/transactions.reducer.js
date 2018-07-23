import {
  TRANSACTIONS_READ_REQUEST,
  TRANSACTIONS_DELETE_REQUEST,
  TRANSACTIONS_CREATE_REQUEST,
  TRANSACTIONS_UPDATE_REQUEST,
  ACCOUNTS_CURRENCY_REQUEST,
  USER_LOGOUT
} from '../constants';

const initialState = [];

function transactions(state = initialState, action) {
  switch (action.type) {
  case TRANSACTIONS_READ_REQUEST:
    return Array.from(action.transactions);

  case TRANSACTIONS_DELETE_REQUEST: {
    return state.filter(t => t.id !== action.id);
  }
  case TRANSACTIONS_CREATE_REQUEST: {
    let transactions = Array.from(state);
    transactions.push(action.transaction);
    return transactions;
  }
  case TRANSACTIONS_UPDATE_REQUEST: {
    let transactions = Array.from(state);
    transactions = transactions.filter(t => t.id !== action.transaction.id);
    transactions.push(action.transaction);
    return transactions;
  }
  case USER_LOGOUT:
    return initialState;
  default:
    return state;
  }
}

export default transactions;