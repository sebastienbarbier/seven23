
import {
  CHANGES_CREATE_REQUEST,
  CHANGES_READ_REQUEST,
  CHANGES_UPDATE_REQUEST,
  CHANGES_DELETE_REQUEST,
  CHANGE_EVENT
} from '../constants';

import dispatcher from '../dispatcher/AppDispatcher';
import storage from '../storage';
import { EventEmitter } from 'events';
import axios from 'axios';

let changes = [];
let chain = [];
let isLoading = true;

class ChangeStore extends EventEmitter {

  constructor() {
    super();
  }

  emitChange(args) {
    this.emit(CHANGE_EVENT, args);
  }

  addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback);
  }

  removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }

  onceChangeListener(callback) {
    this.once(CHANGE_EVENT, callback);
  }

  get changes() {
    return changes;
  }

  get chain() {
    return chain;
  }

  isLoading() {
    return isLoading;
  }

  /**
   * This function create a chain of change event.
   * It is represented as a timeline, to get the exchange rate of a transaction
   * you get the first item from the change before that date, and access all exchange ratio available.
   * @return {Promise}
   */
  buildChangeChain() {
    return new Promise((resolve, reject) => {
      // Generate exchange chain
      var customerObjectStore  = storage.db.transaction('changes', 'readwrite').objectStore('changes');
      customerObjectStore.clear();
      chain = [];

      var counter = 0;
      var lastItem = {};
      for (var i in changes) {
        var item = {
          id: changes[i].id,
          date: changes[i].date,
          rates: new Map(lastItem.rates),
        };

        item.rates.set(changes[i]['local_currency'], new Map(item.rates.get(changes[i]['local_currency'])));
        item.rates.get(changes[i]['local_currency']).set(changes[i]['new_currency'], changes[i]['exchange_rate']);

        item.rates.set(changes[i]['new_currency'], new Map(item.rates.get(changes[i]['new_currency'])));
        item.rates.get(changes[i]['new_currency']).set(changes[i]['local_currency'], 1/changes[i]['exchange_rate']);

        var request = customerObjectStore.add(item);
        chain.push(item);

        lastItem = item;

        request.onsuccess = function(event) {
          counter++;
          if (counter === changes.length) {
            isLoading = false;
            resolve();
          }
        };

        request.onerror = function(event) {
          console.error('ChangeStore buildChangeChain failed');
          counter++;
          if (counter === changes.length) {
            isLoading = false;
            resolve();
          }
        };
      }
      chain = chain.sort((a, b) => {
        return a.date < b.date;
      });
    });
  }

  initialize() {
    var component = this;
    return axios({
      url: '/api/v1/changes',
      method: 'get',
      headers: {
        'Authorization': 'Token '+ localStorage.getItem('token'),
      },
    })
      .then(function(response) {
        changes = response.data.sort((a, b) => {
          return a.date > b.date;
        });
        component.buildChangeChain().then(() => {
          ChangeStoreInstance.emitChange();
        });

      }).catch(function(ex) {
        console.error(ex);
      });
  }

  reset() {
    return Promise.resolve().then(() => {
      changes = [];
      chain = [];
    });
  }
}

let ChangeStoreInstance = new ChangeStore();

ChangeStoreInstance.dispatchToken = dispatcher.register(action => {

  switch(action.type) {
  case CHANGES_CREATE_REQUEST:
      // Create categories
    axios({
      url: '/api/v1/changes',
      method: 'POST',
      headers: {
        'Authorization': 'Token '+ localStorage.getItem('token'),
      },
      data: action.change
    })
      .then((response) => {
        console.log(response.data);
        if (response.data) {
          changes.push(response.data);
          return ChangeStoreInstance.buildChangeChain();
        } else {
          return Promise.reject();
        }
      })
      .then(() => {
        ChangeStoreInstance.emitChange();
      })
      .catch((exception) => {
        ChangeStoreInstance.emitChange(exception.response ? exception.response.data : null);
      });
    break;
  case CHANGES_READ_REQUEST:
    break;
  case CHANGES_UPDATE_REQUEST:
      // Create categories
    axios({
      url: '/api/v1/changes/' + action.change.id,
      method: 'PUT',
      headers: {
        'Authorization': 'Token '+ localStorage.getItem('token'),
      },
      data: action.change
    })
      .then((response) => {
        if (response.data) {
          changes = changes.filter((change) => {
            return change.id !== action.change.id;
          });
          changes.push(action.change);
          return ChangeStoreInstance.buildChangeChain();
        } else {
          return Promise.reject();
        }
      })
      .then(() => {
        ChangeStoreInstance.emitChange();
      })
      .catch((exception) => {
        ChangeStoreInstance.emitChange(exception.response ? exception.response.data : null);
      });
    break;
  case CHANGES_DELETE_REQUEST:
    axios({
      url: '/api/v1/changes/' + action.change.id,
      method: 'DELETE',
      headers: {
        'Authorization': 'Token '+ localStorage.getItem('token'),
      }
    })
      .then((response) => {
        return ChangeStoreInstance.initialize();
      })
      .then(() => {
        ChangeStoreInstance.emitChange();
      })
      .catch((exception) => {
        console.error(exception);
      });
    break;
  default:
    return;
  }

});

export default ChangeStoreInstance;
