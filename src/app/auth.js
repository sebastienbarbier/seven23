import AccountStore from './stores/AccountStore';
import CategoryStore from './stores/CategoryStore';
import ChangeStore from './stores/ChangeStore';
import CurrencyStore from './stores/CurrencyStore';
import TransactionStore from './stores/TransactionStore';
import UserStore from './stores/UserStore';
import ServerStore from './stores/ServerStore';

import axios from 'axios';

let isInit = false;

class Auth {

  loggedIn() {
    return localStorage.getItem('token') !== null;
  }

  initialize() {
    if (isInit) {
      return Promise.resolve();
    }

    return AccountStore.initialize()
      .then(() => {
        return axios.all([
          CurrencyStore.initialize(),
          CategoryStore.initialize(),
          UserStore.initialize(),
          ChangeStore.initialize(),
          TransactionStore.initialize(),
          ServerStore.initialize()
        ]);
      })
      .then(() => {
        isInit = true; // Avoid multi initialization
      })
      .catch((err) => {
        console.error(err);
      });
  }

  isInitialize() {
    return isInit;
  }

  reset() {
    isInit = false;
    return Promise.resolve();
  }

}

let AuthInstance = new Auth();

export default AuthInstance;
