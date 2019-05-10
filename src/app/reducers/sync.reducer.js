
import {
  TRANSACTIONS_CREATE_REQUEST,
  TRANSACTIONS_UPDATE_REQUEST,
  TRANSACTIONS_DELETE_REQUEST,
  CHANGES_CREATE_REQUEST,
  CHANGES_UPDATE_REQUEST,
  CHANGES_DELETE_REQUEST,
  CATEGORIES_CREATE_REQUEST,
  CATEGORIES_UPDATE_REQUEST,
  CATEGORIES_DELETE_REQUEST,
  SERVER_SYNCED,
  USER_LOGOUT,
} from '../constants';

const initialState = {
  counter: 0,
  transactions: {
    create: [],
    udpate: [],
    delete: [],
  },
  changes: {
    create: [],
    udpate: [],
    delete: [],
  },
  categories: {
    create: [],
    udpate: [],
    delete: [],
  },
};

function sync(state = initialState, action) {
  switch (action.type) {
  case TRANSACTIONS_CREATE_REQUEST: {
    const res = Object.assign({}, state);
    res.counter += 1;
    res.transactions.create.push(action.transaction.id);
    return res;
  }
  case TRANSACTIONS_UPDATE_REQUEST: {
    const res = Object.assign({}, state);
    if (res.transactions.create.indexOf(action.transaction.id) === -1) {
      res.counter += 1;
      res.transactions.update.push(action.transaction.id);
    }
    return res;
  }
  case TRANSACTIONS_DELETE_REQUEST: {
    const res = Object.assign({}, state);
    const indexCreate = res.transactions.create.indexOf(action.id);
    if (indexCreate != -1) {
      res.counter -= 1;
      res.transactions.create.splice(indexCreate, 1);
    }
    const indexUpdate = res.transactions.udpate.indexOf(action.id);
    if (indexUpdate != -1) {
      res.counter -= 1;
      res.transacitons.udpate.splice(indexUpdate, 1);
    }
    res.counter += 1;
    res.transactions.delete.push(action.id);
    return res;
  }
  case CHANGES_CREATE_REQUEST: {
    const res = Object.assign({}, state);
    res.counter += 1;
    res.changes.create.push(action.change.id);
    return res;
  }
  case CHANGES_UPDATE_REQUEST: {
    const res = Object.assign({}, state);
    if (res.changes.create.indexOf(action.change.id) === -1) {
      res.counter += 1;
      res.changes.update.push(action.change.id);
    }
    return res;
  }
  case CHANGES_DELETE_REQUEST: {
    const res = Object.assign({}, state);
    const indexCreate = res.changes.create.indexOf(action.id);
    if (indexCreate != -1) {
      res.counter -= 1;
      res.changes.create.splice(indexCreate, 1);
    }
    const indexUpdate = res.changes.udpate.indexOf(action.id);
    if (indexUpdate != -1) {
      res.counter -= 1;
      res.changes.udpate.splice(indexUpdate, 1);
    }
    res.counter += 1;
    res.changes.delete.push(action.id);
    return res;
  }
  case CATEGORIES_CREATE_REQUEST: {
    const res = Object.assign({}, state);
    res.counter += 1;
    res.categories.create.push(action.category.id);
    return res;
  }
  case CATEGORIES_UPDATE_REQUEST: {
    const res = Object.assign({}, state);
    if (res.transactions.create.indexOf(action.category.id) === -1) {
      res.counter += 1;
      res.categories.update.push(action.category.id);
    }
    return res;
  }
  case CATEGORIES_DELETE_REQUEST: {
    const res = Object.assign({}, state);
    const indexCreate = res.categories.create.indexOf(action.id);
    if (indexCreate != -1) {
      res.counter -= 1;
      res.categories.create.splice(indexCreate, 1);
    }
    const indexUpdate = res.categories.udpate.indexOf(action.id);
    if (indexUpdate != -1) {
      res.counter -= 1;
      res.categories.udpate.splice(indexUpdate, 1);
    }
    res.counter += 1;
    res.categories.delete.push(action.id);
    return res;
  }
  case SERVER_SYNCED:
    return Object.assign({}, initialState);
  case USER_LOGOUT:
    return Object.assign({}, initialState);
  default:
    return state;
  }
}

export default sync;