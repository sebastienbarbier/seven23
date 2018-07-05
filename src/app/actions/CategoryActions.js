import axios from 'axios';

import storage from '../storage';
import dispatcher from '../dispatcher/AppDispatcher';

import {
  CATEGORIES_CREATE_REQUEST,
  CATEGORIES_READ_REQUEST,
  CATEGORIES_UPDATE_REQUEST,
  CATEGORIES_DELETE_REQUEST,
} from '../constants';

import Worker from '../workers/Categories.worker';

const worker = new Worker();
var CategoryActions = {

  sync: () => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        axios({
          url: '/api/v1/categories',
          method: 'get',
          headers: {
            Authorization: 'Token ' + getState().user.token,
          },
        }).then(function(response) {
          // Load transactions store
          storage
            .connectIndexedDB()
            .then(connection => {
              var customerObjectStore = connection
                .transaction('categories', 'readwrite')
                .objectStore('categories');
              // Delete all previous objects
              customerObjectStore.clear();
              var counter = 0;
              // For each object retrieved by our request.
              for (var i in response.data) {
                // Save in storage.
                var request = customerObjectStore.add(response.data[i]);
                request.onsuccess = function(event) {
                  counter++;
                  // On last success, we trigger an event.
                  if (counter === response.data.length) {
                    worker.onmessage = function(event) {
                      // Receive message { type: ..., categoriesList: ..., categoriesTree: ... }
                      if (event.data.type === CATEGORIES_READ_REQUEST) {
                        dispatch({
                          type: CATEGORIES_READ_REQUEST,
                          list: event.data.categoriesList,
                          tree: event.data.categoriesTree
                        });
                        resolve();
                      } else {
                        console.error(event);
                        reject(event);
                      }
                    };
                    worker.postMessage({
                      type: CATEGORIES_READ_REQUEST,
                      account: getState().account.id
                    });
                  }
                };
                request.onerror = function(event) {
                  console.error(event);
                  reject(event);
                };
              }
            })
            .catch(function(ex) {
              console.error(ex);
              reject(ex);
            });
        });
      });
    };
  },
  /**
   * @param  {string} category
   */
  create: category => {
    dispatcher.dispatch({
      type: CATEGORIES_CREATE_REQUEST,
      category: category,
    });
  },

  read: (data = {}) => {
    dispatcher.dispatch({
      type: CATEGORIES_READ_REQUEST,
      account: data.account,
      id: data.id,
    });
  },

  update: category => {
    dispatcher.dispatch({
      type: CATEGORIES_UPDATE_REQUEST,
      category: category,
    });
  },

  delete: id => {
    dispatcher.dispatch({
      type: CATEGORIES_DELETE_REQUEST,
      id: id,
    });
  },
};

export default CategoryActions;
