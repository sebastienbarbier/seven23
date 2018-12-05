import axios from 'axios';

import storage from '../storage';
import encryption from '../encryption';

import {
  CHANGES_READ_REQUEST,
  CHANGES_EXPORT,
  SERVER_LAST_EDITED,
  SERVER_SYNCED,
} from '../constants';

import Worker from '../workers/Changes.worker';
const worker = new Worker();

var ChangesActions = {

  sync: () => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {

        const { last_edited } = getState().server;
        let url = '/api/v1/changes';
        if (last_edited) {
          url = url + '?last_edited=' + last_edited;
        }

        axios({
          url: url,
          method: 'get',
          headers: {
            Authorization: 'Token ' + getState().user.token,
          },
        })
          .then(function(response) {
            if ((!last_edited && response.data.length === 0) || !getState().account.id) {
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

                let { last_edited } = getState().server;

                // Delete all previous objects
                if (!last_edited) {
                  customerObjectStore.clear();
                }

                const addObject = i => {

                  let obj = i.next();

                  if (obj && obj.value) {
                    // Save in storage.
                    obj = obj.value[1];

                    if (obj.deleted) {

                      if (!last_edited || obj.last_edited > last_edited) {
                        last_edited = obj.last_edited;
                      }

                      var request = customerObjectStore.delete(obj.id);
                      request.onsuccess = function(event) {
                        addObject(i);
                      };
                      request.onerror = function(event) {
                        console.error(event);
                        reject();
                      };
                    } else {
                      encryption.decrypt(obj.blob === '' ? '{}' : obj.blob).then((json) => {

                        obj = Object.assign({}, obj, json);
                        delete obj.blob;

                        if (obj.date && obj.name) {

                          obj.year = obj.date.slice(0, 4);
                          obj.month = obj.date.slice(5, 7);
                          obj.day = obj.date.slice(8, 10);
                          obj.date = new Date(obj.year, obj.month - 1, obj.day, 0, 0, 0);

                          if (!last_edited || obj.last_edited > last_edited) {
                            last_edited = obj.last_edited;
                          }

                          const saveObject = (obj) => {
                            var request = customerObjectStore.put(obj);
                            request.onsuccess = function(event) {
                              addObject(i);
                            };
                            request.onerror = function(event) {
                              console.error(event);
                              reject();
                            };
                          };

                          try {
                            saveObject(obj);
                          } catch (exception) {
                            if (exception instanceof DOMException) {
                              customerObjectStore = connection
                                .transaction('changes', 'readwrite')
                                .objectStore('changes');
                              saveObject(obj);
                            } else {
                              reject(exception);
                            }
                          }
                        } else {
                          addObject(i);
                        }
                      }).catch((exception) => {
                        console.error(exception);
                      });
                    }

                  } else {
                    worker.onmessage = function(event) {
                      if (event.data.type === CHANGES_READ_REQUEST) {
                        dispatch({
                          type: SERVER_LAST_EDITED,
                          last_edited: last_edited,
                        });
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

        const blob = {};

        blob.name = change.name;
        blob.date = change.date;
        blob.local_amount = change.local_amount;
        blob.local_currency = change.local_currency;
        blob.new_amount = change.new_amount;
        blob.new_currency = change.new_currency;

        encryption.encrypt(blob).then((json) => {
          change.blob = json;

          delete change.name;
          delete change.date;
          delete change.local_amount;
          delete change.local_currency;
          delete change.new_amount;
          delete change.new_currency;

          axios({
            url: '/api/v1/changes',
            method: 'POST',
            headers: {
              Authorization: 'Token ' + getState().user.token,
            },
            data: change,
          })
            .then(response => {

              let change = response.data;
              change = Object.assign({}, change, blob);
              delete change.blob;
              change.date = new Date(change.date);

              storage.connectIndexedDB().then(connection => {
                connection
                  .transaction('changes', 'readwrite')
                  .objectStore('changes')
                  .put(change);

                worker.onmessage = function(event) {
                  if (event.data.type === CHANGES_READ_REQUEST) {
                    dispatch({
                      type: SERVER_SYNCED
                    });
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
      });
    };
  },

  update: change => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        const blob = {};

        blob.name = change.name;
        blob.date = change.date;
        blob.local_amount = change.local_amount;
        blob.local_currency = change.local_currency;
        blob.new_amount = change.new_amount;
        blob.new_currency = change.new_currency;

        encryption.encrypt(blob).then((json) => {

          change.blob = json;

          delete change.name;
          delete change.date;
          delete change.local_amount;
          delete change.local_currency;
          delete change.new_amount;
          delete change.new_currency;

          axios({
            url: '/api/v1/changes/' + change.id,
            method: 'PUT',
            headers: {
              Authorization: 'Token ' + getState().user.token,
            },
            data: change,
          })
            .then(response => {

              try {
                let change = Object.assign({}, response.data, blob);
                delete change.blob;

                change.date = new Date(change.date);

                storage.connectIndexedDB().then(connection => {
                  connection
                    .transaction('changes', 'readwrite')
                    .objectStore('changes')
                    .put(change);

                  worker.onmessage = function(event) {
                    if (event.data.type === CHANGES_READ_REQUEST) {
                      dispatch({
                        type: CHANGES_READ_REQUEST,
                        list: event.data.changes,
                        chain: event.data.chain,
                      });
                      dispatch({
                        type: SERVER_SYNCED
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
              } catch (exception) {
                console.error(exception);
                reject();
              }
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
                  dispatch({
                    type: SERVER_SYNCED
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

      const blob = {};

      blob.name = change.name;
      blob.date = change.date;
      blob.local_amount = change.local_amount;
      blob.local_currency = change.local_currency;
      blob.new_amount = change.new_amount;
      blob.new_currency = change.new_currency;

      encryption.encrypt(blob).then((json) => {

        change.blob = JSON.stringify(blob);

        delete change.name;
        delete change.date;
        delete change.local_amount;
        delete change.local_currency;
        delete change.new_amount;
        delete change.new_currency;

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

              let change = Object.assign({}, response.data, blob);
              delete change.blob;

              change.date = new Date(change.date);

              response.data.date = new Date(response.data.date);
              storage.connectIndexedDB().then(connection => {
                connection
                  .transaction('changes', 'readwrite')
                  .objectStore('changes')
                  .put(change);

                resolve(change);
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
