import axios from 'axios';

import storage from '../storage';
import dispatcher from '../dispatcher/AppDispatcher';

import {
  CHANGES_READ_REQUEST,
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
            // Load transactions store
            storage.connectIndexedDB().then(connection => {
              var customerObjectStore = connection
                .transaction('changes', 'readwrite')
                .objectStore('changes');
              // Delete all previous objects
              customerObjectStore.clear();
              var counter = 0;
              // For each object retrieved by our request.
              for (var i in response.data) {
                // Save in storage.
                var obj = response.data[i];

                obj.year = obj.date.slice(0, 4);
                obj.month = obj.date.slice(5, 7);
                obj.day = obj.date.slice(8, 10);
                obj.date = new Date(
                  Date.UTC(obj.year, obj.month - 1, obj.day, 0, 0, 0),
                );

                var request = customerObjectStore.add(obj);
                request.onsuccess = function(event) {
                  counter++;
                  // On last success, we trigger an event.
                  if (counter === response.data.length) {
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
                request.onerror = function(event) {
                  console.error(event);
                  reject();
                };
              }
            });
          })
          .catch(function(ex) {
            console.error(ex);
            reject();
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
  /**
   * @param  {string} change
   */

  read: (data = {}) => {
    dispatcher.dispatch({
      type: CHANGES_READ_REQUEST,
      account: data.account,
      id: data.id,
    });
  },
};

export default ChangesActions;
