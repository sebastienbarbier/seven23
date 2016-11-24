
import {
  CURRENCIES_CREATE_REQUEST,
  CURRENCIES_READ_REQUEST,
  CHANGE_EVENT,
} from '../constants';

import dispatcher from '../dispatcher/AppDispatcher';
import AccountStore from '../stores/AccountStore';
import { EventEmitter } from 'events';
import axios from 'axios';

let currencies = [];
let currenciesIndexed = {};

class CurrencyStore extends EventEmitter {

  constructor() {
    super();
  }

  emitChange() {
    this.emit(CHANGE_EVENT);
  }

  addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback);
  }

  removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }

  get currenciesArray() {
    return currencies;
  }

  // return currency ID
  getSelectedCurrency() {
    return AccountStore.selectedAccount().currency;
  }

  getAllCurrencies() {
    return currencies;
  }

  get(id) {
    return currenciesIndexed[id];
  }

  getIndexedCurrencies() {
    return currenciesIndexed;
  }

  format(value, currency_id) {
    if (currency_id === undefined) {
      currency_id = AccountStore.selectedAccount().currency;
    }
    var currency = currenciesIndexed[currency_id];
    var sign = '';
    if (value < 0) {
      sign = '- ';
      value = value * -1;
    }
    if (currency.after_amount) {
      return sign + parseFloat(value).toFixed(2) + (currency.space ? ' ' : '') + currency.sign;
    } else {
      return currency.sign + (currency.space ? ' ' : '') + sign + parseFloat(value).toFixed(2);
    }
  }

  initialize() {
    return axios({
      url: '/api/v1/currencies',
      method: 'get',
      headers: {
        'Authorization': 'Token '+ localStorage.getItem('token'),
      },
    })
    .then(function(response) {
      currencies = response.data;
      response.data.forEach((currency) => {
        currenciesIndexed[currency.id] = currency;
      });

      // We need to build a model to easily preproccess change rate.
      CurrencyStoreInstance.emitChange();
    }).catch(function(ex) {
      console.error(ex);
    });
  }

  reset() {
    currencies = [];
    return Promise.resolve();
  }

}

let CurrencyStoreInstance = new CurrencyStore();

CurrencyStoreInstance.dispatchToken = dispatcher.register(action => {

  switch(action.type) {
  case CURRENCIES_READ_REQUEST:
    axios({
      url: '/api/v1/currencies',
      method: 'get',
      headers: {
        'Authorization': 'Token '+ localStorage.getItem('token'),
      },
    })
      .then(function(response) {
        CurrencyStoreInstance.emitChange();
      }).catch(function(ex) {
        console.error(ex);
      });
    break;
  case CURRENCIES_CREATE_REQUEST:
    break;

  default:
    return;
  }
});

export default CurrencyStoreInstance;
