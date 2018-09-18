import axios from 'axios';

import storage from '../storage';

import {
  CHANGES_READ_REQUEST,
  CHANGES_IMPORT,
  CHANGES_EXPORT,
} from '../constants';

import Worker from '../workers/Changes.worker';
const worker = new Worker();

var ChangesActions = {

  sync: () => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        axios({
          url: '/api/v1/changes',
          method: 'get',
          headers: {
            Authorization: 'Token ' + getState().user.token,
          },
        })
          .then(function(response) {
            if (response.data.length === 0) {
              dispatch({
                type: CHANGES_READ_REQUEST,
                list: [],
                chain: [],
              });
              resolve();
            } else {
              // Load transactions store
              storage.connectIndexedDB().then(connection => {
                var customerObjectStore = connection
                  .transaction('changes', 'readwrite')
                  .objectStore('changes');
                // Delete all previous objects
                customerObjectStore.clear();

                const addObject = i => {

                  let obj = i.next();

                  if (obj && obj.value) {
                    // Save in storage.
                    obj = obj.value[1];

                    let json = {};
                    try {
                      json = JSON.parse(obj.blob === '' ? '{}' : obj.blob);
                    } catch (exception) {
                      console.error(exception);
                    }

                    obj = Object.assign({}, obj, json);
                    delete obj.blob;

                    if (obj.date && obj.name) {

                      obj.year = obj.date.slice(0, 4);
                      obj.month = obj.date.slice(5, 7);
                      obj.day = obj.date.slice(8, 10);
                      obj.date = new Date(obj.year, obj.month - 1, obj.day, 0, 0, 0);

                      var request = customerObjectStore.add(obj);
                      request.onsuccess = function(event) {
                        addObject(i);
                      };
                      request.onerror = function(event) {
                        console.error(event);
                        reject();
                      };
                    } else {
                      addObject(i);
                    }
                  } else {
                    worker.onmessage = function(event) {
                      if (event.data.type === CHANGES_READ_REQUEST) {
                        dispatch({
                          type: CHANGES_READ_REQUEST,
                          list: event.data.changes,
                          chain: event.data.chain,
                        });
                        resolve();
                      } else {
                        console.error(event);
                        reject(event);
                      }
                    };
                    worker.postMessage({
                      type: CHANGES_READ_REQUEST,
                      account: getState().account.id
                    });
                  }
                };


                var iterator = response.data.entries();
                addObject(iterator);

              });
            }
          })
          .catch(function(ex) {
            console.error(ex);
            reject();
          });
      });
    };
  },

  refresh: () => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        worker.onmessage = function(event) {
          if (event.data.type === CHANGES_READ_REQUEST) {
            dispatch({
              type: CHANGES_READ_REQUEST,
              list: event.data.changes,
              chain: event.data.chain,
            });
            resolve();
          } else {
            console.error(event);
            reject(event);
          }
        };
        worker.postMessage({
          type: CHANGES_READ_REQUEST,
          account: getState().account.id
        });
      });
    };
  },

  create: change => {
    return (dispatch, getState) => {

      return new Promise((resolve, reject) => {
        axios({
          url: '/api/v1/changes',
          method: 'POST',
          headers: {
            Authorization: 'Token ' + getState().user.token,
          },
          data: change,
        })
          .then(response => {

            response.data.date = new Date(response.data.date);
            storage.connectIndexedDB().then(connection => {
              connection
                .transaction('changes', 'readwrite')
                .objectStore('changes')
                .put(response.data);

              worker.onmessage = function(event) {
                if (event.data.type === CHANGES_READ_REQUEST) {
                  dispatch({
                    type: CHANGES_READ_REQUEST,
                    list: event.data.changes,
                    chain: event.data.chain,
                  });
                  resolve();
                } else {
                  console.error(event);
                  reject(event);
                }
              };
              worker.postMessage({
                type: CHANGES_READ_REQUEST,
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

  update: change => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        axios({
          url: '/api/v1/changes/' + change.id,
          method: 'PUT',
          headers: {
            Authorization: 'Token ' + getState().user.token,
          },
          data: change,
        })
          .then(response => {
            response.data.date = new Date(response.data.date);
            storage.connectIndexedDB().then(connection => {
              connection
                .transaction('changes', 'readwrite')
                .objectStore('changes')
                .put(response.data);

              worker.onmessage = function(event) {
                if (event.data.type === CHANGES_READ_REQUEST) {
                  dispatch({
                    type: CHANGES_READ_REQUEST,
                    list: event.data.changes,
                    chain: event.data.chain,
                  });
                  resolve();
                } else {
                  console.error(event);
                  reject(event);
                }
              };
              worker.postMessage({
                type: CHANGES_READ_REQUEST,
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

  delete: change => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        axios({
          url: '/api/v1/changes/' + change.id,
          method: 'DELETE',
          headers: {
            Authorization: 'Token ' + localStorage.getItem('token'),
          },
        })
          .then(response => {
            storage.connectIndexedDB().then(connection => {
              connection
                .transaction('changes', 'readwrite')
                .objectStore('changes')
                .delete(change.id);

              worker.onmessage = function(event) {
                if (event.data.type === CHANGES_READ_REQUEST) {
                  dispatch({
                    type: CHANGES_READ_REQUEST,
                    list: event.data.changes,
                    chain: event.data.chain,
                  });
                  resolve();
                } else {
                  console.error(event);
                  reject(event);
                }
              };
              worker.postMessage({
                type: CHANGES_READ_REQUEST,
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

  import: (change) => {
    return (dispatch, getState) => {

      return new Promise((resolve, reject) => {
        axios({
          url: '/api/v1/changes',
          method: 'POST',
          headers: {
            Authorization: 'Token ' + getState().user.token,
          },
          data: change,
        })
          .then(response => {

            response.data.date = new Date(response.data.date);
            storage.connectIndexedDB().then(connection => {
              connection
                .transaction('changes', 'readwrite')
                .objectStore('changes')
                .put(response.data);

              resolve(response.data);
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

  export: (id) => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        worker.onmessage = function(event) {
          if (event.data.type === CHANGES_EXPORT) {
            resolve({
              changes: event.data.changes
            });
          } else {
            console.error(event);
            reject(event);
          }
        };
        worker.postMessage({
          type: CHANGES_EXPORT,
          account: id
        });
      });
    };
  },
};

export default ChangesActions;
