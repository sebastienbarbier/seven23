import axios from 'axios';

import storage from '../storage';

import {
  CATEGORIES_READ_REQUEST,
  CATEGORIES_EXPORT,
  CATEGORIES_IMPORT,
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
          if (response.data.length === 0) {
            dispatch({
              type: CATEGORIES_READ_REQUEST,
              list: [],
              tree: [],
            });
            resolve();
          } else {
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
                            tree: event.data.categoriesTree,
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
          }
        });
      });
    };
  },

  refresh: () => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
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
      });
    };
  },

  create: category => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        if (category.parent === null) {
          delete category.parent;
        }
        axios({
          url: '/api/v1/categories',
          method: 'POST',
          headers: {
            Authorization: 'Token ' + getState().user.token,
          },
          data: category,
        })
          .then(response => {
            storage.connectIndexedDB().then(connection => {
              connection
                .transaction('categories', 'readwrite')
                .objectStore('categories')
                .add(response.data);

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
            });
          })
          .catch(error => {
            if (error.response.status !== 400) {
              console.error(error);
            }
            return reject(error.response);
          });
      });
    };
  },

  update: category => {

    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        if (category.parent === null) {
          delete category.parent;
        }
        axios({
          url: '/api/v1/categories/' + category.id,
          method: 'PUT',
          headers: {
            Authorization: 'Token ' + getState().user.token,
          },
          data: category,
        })
          .then(response => {
            storage.connectIndexedDB().then(connection => {
              connection
                .transaction('categories', 'readwrite')
                .objectStore('categories')
                .put(response.data);

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
            });
          })
          .catch(exception => {
            if (error.response.status !== 400) {
              console.error(error);
            }
            return reject(error.response);
          });
      });
    };
  },

  delete: id => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        axios({
          url: '/api/v1/categories/' + id,
          method: 'DELETE',
          headers: {
            Authorization: 'Token ' + getState().user.token,
          },
        })
          .then(response => {
            storage.connectIndexedDB().then(connection => {
              connection
                .transaction('categories', 'readwrite')
                .objectStore('categories')
                .delete(id);

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
            });
          })
          .catch(error => {
            if (error.status !== 400) {
              console.error(error);
            }
            return reject(error.response);
          });
      });
    };
  },

  import: (categories) => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        worker.onmessage = function(event) {
          if (event.data.type === CATEGORIES_IMPORT) {
            resolve();
          } else {
            console.error(event);
            reject(event);
          }
        };
        worker.postMessage({
          type: CATEGORIES_IMPORT,
          categories: categories
        });
      });
    };
  },

  export: (id) => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        worker.onmessage = function(event) {
          if (event.data.type === CATEGORIES_EXPORT) {
            resolve({
              categories: []
            });
          } else {
            console.error(event);
            reject(event);
          }
        };
        worker.postMessage({
          type: CATEGORIES_EXPORT,
          account: id
        });
      });
    };
  },
};

export default CategoryActions;
