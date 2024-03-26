import {
  CATEGORIES_CREATE_REQUEST,
  CATEGORIES_DELETE_REQUEST,
  CATEGORIES_UPDATE_REQUEST,
  CHANGES_CREATE_REQUEST,
  CHANGES_DELETE_REQUEST,
  CHANGES_UPDATE_REQUEST,
  RESET,
  SERVER_SYNC,
  SERVER_SYNCED,
  TRANSACTIONS_CREATE_REQUEST,
  TRANSACTIONS_DELETE_REQUEST,
  TRANSACTIONS_UPDATE_REQUEST,
  USER_LOGOUT,
} from "../constants";

const initialState = {
  counter: 0,
  transactions: {
    create: [],
    update: [],
    delete: [],
  },
  changes: {
    create: [],
    update: [],
    delete: [],
  },
  categories: {
    create: [],
    update: [],
    delete: [],
  },
};

function sync(state = initialState, action) {
  switch (action.type) {
    case TRANSACTIONS_CREATE_REQUEST: {
      if (action.isLocal) {
        return state;
      }
      const res = Object.assign({}, state);
      res.counter += 1;
      res.transactions.create.push(action.transactions[0].id);
      return res;
    }
    case TRANSACTIONS_UPDATE_REQUEST: {
      if (action.isLocal) {
        return state;
      }
      const res = Object.assign({}, state);
      if (res.transactions.create.indexOf(action.transactions[0].id) === -1) {
        if (res.transactions.update.indexOf(action.transactions[0].id) === -1) {
          res.counter += 1;
          // Test if id is integer to fix #71, which push PUT with uuid
          if (Number.isInteger(action.transactions[0].id)) {
            res.transactions.update.push(action.transactions[0].id);
          } else {
            res.transactions.create.push(action.transactions[0].id);
          }
        }
      }
      return res;
    }
    case TRANSACTIONS_DELETE_REQUEST: {
      if (action.isLocal) {
        return state;
      }
      const res = Object.assign({}, state);
      // If transactions was about to be created
      const indexCreate = res.transactions.create.indexOf(action.id);
      if (indexCreate != -1) {
        res.counter -= 1;
        res.transactions.create.splice(indexCreate, 1);
      } else {
        // If transactions was about to be updated
        const indexUpdate = res.transactions.update.indexOf(action.id);
        if (indexUpdate != -1) {
          res.counter -= 1;
          res.transactions.update.splice(indexUpdate, 1);
        }
        // Test if id is integer to fix #104, which send DELETE with uuid
        if (Number.isInteger(action.id)) {
          res.counter += 1;
          res.transactions.delete.push(action.id);
        }
      }
      return res;
    }
    case CHANGES_CREATE_REQUEST: {
      if (action.isLocal) {
        return state;
      }
      const res = Object.assign({}, state);
      res.counter += 1;
      res.changes.create.push(action.change.id);
      return res;
    }
    case CHANGES_UPDATE_REQUEST: {
      if (action.isLocal) {
        return state;
      }
      const res = Object.assign({}, state);
      if (res.changes.create.indexOf(action.change.id) === -1) {
        if (res.changes.update.indexOf(action.change.id) === -1) {
          res.counter += 1;
          // Test if id is integer to fix #71, which push PUT with uuid
          if (Number.isInteger(action.change.id)) {
            res.changes.update.push(action.change.id);
          } else {
            res.changes.create.push(action.change.id);
          }
        }
      }
      return res;
    }
    case CHANGES_DELETE_REQUEST: {
      if (action.isLocal) {
        return state;
      }
      const res = Object.assign({}, state);
      const indexCreate = res.changes.create.indexOf(action.id);
      if (indexCreate != -1) {
        res.counter -= 1;
        res.changes.create.splice(indexCreate, 1);
      } else {
        const indexUpdate = res.changes.update.indexOf(action.id);
        if (indexUpdate != -1) {
          res.counter -= 1;
          res.changes.update.splice(indexUpdate, 1);
        }
        // Test if id is integer to fix #104, which send DELETE with uuid
        if (Number.isInteger(action.id)) {
          res.counter += 1;
          res.changes.delete.push(action.id);
        }
      }
      return res;
    }
    case CATEGORIES_CREATE_REQUEST: {
      if (action.isLocal) {
        return state;
      }
      const res = Object.assign({}, state);
      res.counter += 1;
      res.categories.create.push(action.category.id);
      return res;
    }
    case CATEGORIES_UPDATE_REQUEST: {
      if (action.isLocal) {
        return state;
      }
      const res = Object.assign({}, state);
      if (res.categories.create.indexOf(action.category.id) === -1) {
        if (res.categories.update.indexOf(action.category.id) === -1) {
          res.counter += 1;
          // Test if id is integer to fix #71, which push PUT with uuid
          if (Number.isInteger(action.category.id)) {
            res.categories.update.push(action.category.id);
          } else {
            res.categories.create.push(action.category.id);
          }
        }
      }
      return res;
    }
    case CATEGORIES_DELETE_REQUEST: {
      if (action.isLocal) {
        return state;
      }
      const res = Object.assign({}, state);
      const indexCreate = res.categories.create.indexOf(action.id);
      if (indexCreate != -1) {
        res.counter -= 1;
        res.categories.create.splice(indexCreate, 1);
      } else {
        const indexUpdate = res.categories.update.indexOf(action.id);
        if (indexUpdate != -1) {
          res.counter -= 1;
          res.categories.update.splice(indexUpdate, 1);
        }
        // Test if id is integer to fix #104, which send DELETE with uuid
        if (Number.isInteger(action.id)) {
          res.counter += 1;
          res.categories.delete.push(action.id);
        }
      }
      return res;
    }
    case SERVER_SYNC:
      // Verify before sync if sync state is coherent.

      // First check is if update array has no string but only integer,
      // otherwise push them in create array (#71)
      const res = Object.assign({}, state);
      res.categories.update = res.categories.update.filter((id) => {
        if (Number.isInteger(id)) {
          return true;
        } else {
          res.categories.create.push(id);
          return false;
        }
      });
      res.categories.delete = res.categories.delete.filter((id) =>
        Number.isInteger(id)
      ); // Fix #104

      res.changes.update = res.changes.update.filter((id) => {
        if (Number.isInteger(id)) {
          return true;
        } else {
          res.changes.create.push(id);
          return false;
        }
      });
      res.changes.delete = res.changes.delete.filter((id) =>
        Number.isInteger(id)
      ); // Fix #104

      res.transactions.update = res.transactions.update.filter((id) => {
        if (Number.isInteger(id)) {
          return true;
        } else {
          res.transactions.create.push(id);
          return false;
        }
      });
      res.transactions.delete = res.transactions.delete.filter((id) =>
        Number.isInteger(id)
      ); // Fix #104

      return res;
    case SERVER_SYNCED:
      return {
        counter: 0,
        transactions: {
          create: [],
          update: [],
          delete: [],
        },
        changes: {
          create: [],
          update: [],
          delete: [],
        },
        categories: {
          create: [],
          update: [],
          delete: [],
        },
      };
    case USER_LOGOUT:
      return {
        counter: 0,
        transactions: {
          create: [],
          update: [],
          delete: [],
        },
        changes: {
          create: [],
          update: [],
          delete: [],
        },
        categories: {
          create: [],
          update: [],
          delete: [],
        },
      };
    case RESET:
      return {
        counter: 0,
        transactions: {
          create: [],
          update: [],
          delete: [],
        },
        changes: {
          create: [],
          update: [],
          delete: [],
        },
        categories: {
          create: [],
          update: [],
          delete: [],
        },
      };
    default:
      return state;
  }
}

export default sync;
