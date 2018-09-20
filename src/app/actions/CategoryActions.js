import axios from 'axios';

import storage from '../storage';
import encryption from '../encryption';

import {
  CATEGORIES_READ_REQUEST,
  CATEGORIES_EXPORT,
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

                const addObject = i => {
                  var obj = i.next();

                  if (obj && obj.value) {
                    obj = obj.value[1];
                    let json = {};

                    encryption.decrypt(obj.blob === '' ? '{}' : obj.blob).then((json) => {
                      obj = Object.assign({}, obj, json);
                      delete obj.blob;

                      if (obj.name) {

                        var request = customerObjectStore.add(obj);
                        request.onsuccess = function(event) {
                          addObject(i);
                        };
                        request.onerror = function(event) {
                          console.error(event);
                          reject(event);
                        };
                      } else {
                        addObject(i);
                      }
                    });
                  } else {
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

                var iterator = response.data.entries();
                addObject(iterator);
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
        // Create blob
        const blob = {};
        blob.name = category.name;
        blob.description = category.description;
        blob.parent = category.parent;

        encryption.encrypt(blob).then((json) => {

          category.blob = json;

          delete category.name;
          delete category.description;
          delete category.parent;

          axios({
            url: '/api/v1/categories',
            method: 'POST',
            headers: {
              Authorization: 'Token ' + getState().user.token,
            },
            data: category,
          })
            .then(response => {

              let obj = response.data;
              let json = {};

              encryption.decrypt(obj.blob === '' ? '{}' : obj.blob).then((json) => {
                obj = Object.assign({}, obj, json);
                delete obj.blob;

                storage.connectIndexedDB().then(connection => {
                  connection
                    .transaction('categories', 'readwrite')
                    .objectStore('categories')
                    .add(obj);

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
              });
            })
            .catch(error => {
              if (error.response.status !== 400) {
                console.error(error);
              }
              return reject(error.response);
            });
        });
      });
    };
  },

  update: category => {

    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        // Create blob
        const blob = {};
        blob.name = category.name;
        blob.description = category.description;
        if (category.parent === null) {
          delete category.parent;
        } else {
          blob.parent = category.parent;
        }

        encryption.encrypt(blob).then((json) => {

          category.blob = json;

          axios({
            url: '/api/v1/categories/' + category.id,
            method: 'PUT',
            headers: {
              Authorization: 'Token ' + getState().user.token,
            },
            data: category,
          })
            .then(response => {

              let obj = response.data;
              let json = {};

              encryption.decrypt(obj.blob === '' ? '{}' : obj.blob).then((json) => {
                obj = Object.assign({}, obj, json);
                delete obj.blob;

                storage.connectIndexedDB().then(connection => {
                  connection
                    .transaction('categories', 'readwrite')
                    .objectStore('categories')
                    .put(obj);

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
              });
            })
            .catch(error => {
              if (error.response.status !== 400) {
                console.error(error);
              }
              return reject(error.response);
            });
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

  import: (category) => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {

        // Create blob
        const blob = {};
        blob.name = category.name;
        if (category.parent === null) {
          delete category.parent;
        } else {
          blob.parent = category.parent;
        }
        encryption.encrypt(blob).then((json) => {
          category.blob = json;
          axios({
            url: '/api/v1/categories',
            method: 'POST',
            headers: {
              Authorization: 'Token ' + getState().user.token,
            },
            data: category,
          })
            .then(response => {
              let obj = response.data;
              let json = {};

              encryption.decrypt(obj.blob === '' ? '{}' : obj.blob).then((json) => {
                obj = Object.assign({}, obj, json);
                delete obj.blob;

                storage.connectIndexedDB().then(connection => {
                  connection
                    .transaction('categories', 'readwrite')
                    .objectStore('categories')
                    .add(obj);

                  resolve(obj);
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

      });
    };
  },

  export: (id) => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        worker.onmessage = function(event) {
          if (event.data.type === CATEGORIES_EXPORT) {
            resolve({
              categories: event.data.categories
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
