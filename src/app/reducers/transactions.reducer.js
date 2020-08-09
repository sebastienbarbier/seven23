import {
  TRANSACTIONS_READ_REQUEST,
  TRANSACTIONS_DELETE_REQUEST,
  TRANSACTIONS_CREATE_REQUEST,
  TRANSACTIONS_UPDATE_REQUEST,
  TRANSACTIONS_SWITCH_ID,
  ACCOUNTS_SWITCH_REQUEST,
  ACCOUNTS_CURRENCY_REQUEST,
  USER_LOGOUT,
  RESET,
} from "../constants";

const initialState = null;

function transactions(state = initialState, action) {
  switch (action.type) {
    case TRANSACTIONS_READ_REQUEST:
      return Array.from(action.transactions || []);
    case TRANSACTIONS_DELETE_REQUEST: {
      return state.filter((t) => t.id !== action.id);
    }
    case TRANSACTIONS_CREATE_REQUEST: {
      let transactions = Array.from(state);
      transactions = [...transactions, ...action.transactions];
      return transactions;
    }
    case TRANSACTIONS_UPDATE_REQUEST: {
      let transactions = Array.from(state);
      transactions = transactions.filter(
        (t) => t.id !== action.transactions[0].id
      );
      transactions = [...transactions, ...action.transactions];
      return transactions;
    }
    case TRANSACTIONS_SWITCH_ID: {
      let transactions = Array.from(state);
      transactions.forEach((transaction) => {
        if (transaction.id == action.old) {
          transaction.id = action.new;
          transaction.old_id = action.old;
        }
      });
      return transactions;
    }
    case ACCOUNTS_SWITCH_REQUEST: {
      return null;
    }
    case ACCOUNTS_CURRENCY_REQUEST: {
      return null;
    }
    case RESET:
      return null;
    default:
      return state;
  }
}

export default transactions;
