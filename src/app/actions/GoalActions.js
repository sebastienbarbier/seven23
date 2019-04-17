import axios from 'axios';

import storage from '../storage';
import encryption from '../encryption';

import {
  GOALS_READ_REQUEST,
  GOALS_EXPORT,
  SERVER_LAST_EDITED,
  SERVER_SYNCED,
  UPDATE_ENCRYPTION,
  ENCRYPTION_KEY_CHANGED,
  FLUSH,
} from '../constants';

import Worker from '../workers/Goals.worker';
const worker = new Worker();

var GoalsActions = {

  sync: () => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        resolve();
      //   const { last_edited } = getState().server;
      //   let url = '/api/v1/goals';
      //   if (last_edited) {
      //     url = url + '?last_edited=' + last_edited;
      //   }

      //   axios({
      //     url: url,
      //     method: 'get',
      //     headers: {
      //       Authorization: 'Token ' + getState().user.token,
      //     },
      //   })
      //     .then(function(response) {
      //       if ((!last_edited && response.data.length === 0) || !getState().account.id) {
      //         dispatch({
      //           type: GOALS_READ_REQUEST,
      //           goals: [],
      //         });
      //         resolve();
      //       } else {
      //         // Load transactions store
      //         storage.connectIndexedDB().then(connection => {
      //           var customerObjectStore = connection
      //             .transaction('goals', 'readwrite')
      //             .objectStore('goals');

      //           let { last_edited } = getState().server;

      //           // Delete all previous objects
      //           if (!last_edited) {
      //             customerObjectStore.clear();
      //           }

      //           const addObject = i => {

      //             let obj = i.next();

      //             if (obj && obj.value) {
      //               // Save in storage.
      //               obj = obj.value[1];

      //               if (obj.deleted) {

      //                 if (!last_edited || obj.last_edited > last_edited) {
      //                   last_edited = obj.last_edited;
      //                 }

      //                 var request = customerObjectStore.delete(obj.id);
      //                 request.onsuccess = function(event) {
      //                   addObject(i);
      //                 };
      //                 request.onerror = function(event) {
      //                   console.error(event);
      //                   reject();
      //                 };
      //               } else {
      //                 encryption.decrypt(obj.blob === '' ? '{}' : obj.blob).then((json) => {

      //                   obj = Object.assign({}, obj, json);
      //                   delete obj.blob;

      //                   if (obj.amount && obj.currency) {

      //                     if (!last_edited || obj.last_edited > last_edited) {
      //                       last_edited = obj.last_edited;
      //                     }

      //                     const saveObject = (obj) => {
      //                       var request = customerObjectStore.put(obj);
      //                       request.onsuccess = function(event) {
      //                         addObject(i);
      //                       };
      //                       request.onerror = function(event) {
      //                         console.error(event);
      //                         reject();
      //                       };
      //                     };

      //                     try {
      //                       saveObject(obj);
      //                     } catch (exception) {
      //                       if (exception instanceof DOMException) {
      //                         customerObjectStore = connection
      //                           .transaction('goals', 'readwrite')
      //                           .objectStore('goals');
      //                         saveObject(obj);
      //                       } else {
      //                         reject(exception);
      //                       }
      //                     }
      //                   } else {
      //                     addObject(i);
      //                   }
      //                 }).catch((exception) => {
      //                   console.error(exception);
      //                   reject();
      //                 });
      //               }

      //             } else {
      //               worker.onmessage = function(event) {
      //                 if (event.data.type === GOALS_READ_REQUEST) {
      //                   dispatch({
      //                     type: SERVER_LAST_EDITED,
      //                     last_edited: last_edited,
      //                   });
      //                   dispatch({
      //                     type: GOALS_READ_REQUEST,
      //                     goals: event.data.goals,
      //                   });
      //                   resolve();
      //                 } else {
      //                   console.error(event);
      //                   reject(event);
      //                 }
      //               };
      //               worker.postMessage({
      //                 type: GOALS_READ_REQUEST,
      //                 account: getState().account.id,
      //                 selectedCurrency: getState().account.currency,
      //               });
      //             }
      //           };

      //           var iterator = response.data.entries();
      //           addObject(iterator);

      //         });
      //       }
      //     })
      //     .catch(function(ex) {
      //       console.error(ex);
      //       reject();
      //     });
      });
    };
  },

  refresh: () => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        resolve();
        // worker.onmessage = function(event) {
        //   if (event.data.type === GOALS_READ_REQUEST) {
        //     dispatch({
        //       type: GOALS_READ_REQUEST,
        //       goals: event.data.goals,
        //     });
        //     resolve();
        //   } else {
        //     console.error(event);
        //     reject(event);
        //   }
        // };
        // worker.postMessage({
        //   type: GOALS_READ_REQUEST,
        //   account: getState().account.id,
        //   selectedCurrency: getState().account.currency,
        // });
      });
    };
  },

  create: goal => {
    return (dispatch, getState) => {

      return new Promise((resolve, reject) => {

        const blob = {};

        blob.type = goal.type;
        blob.amount = goal.amount;
        blob.currency = goal.currency;
        blob.category = goal.category;

        encryption.encrypt(blob).then((json) => {
          goal.blob = json;

          delete goal.type;
          delete goal.amount;
          delete goal.currency;
          delete goal.category;

          axios({
            url: '/api/v1/goals',
            method: 'POST',
            headers: {
              Authorization: 'Token ' + getState().user.token,
            },
            data: goal,
          })
            .then(response => {

              let goal = response.data;
              goal = Object.assign({}, goal, blob);
              delete goal.blob;

              storage.connectIndexedDB().then(connection => {
                connection
                  .transaction('goals', 'readwrite')
                  .objectStore('goals')
                  .put(goal);

                worker.onmessage = function(event) {
                  if (event.data.type === GOALS_READ_REQUEST) {
                    dispatch({
                      type: SERVER_SYNCED
                    });
                    dispatch({
                      type: GOALS_READ_REQUEST,
                      goals: event.data.goals,
                    });
                    resolve();
                  } else {
                    console.error(event);
                    reject(event);
                  }
                };
                worker.postMessage({
                  type: GOALS_READ_REQUEST,
                  account: getState().account.id,
                  selectedCurrency: getState().account.currency,
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

  update: goal => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        const blob = {};

        blob.type = goal.type;
        blob.amount = goal.amount;
        blob.currency = goal.currency;
        blob.category = goal.category;

        encryption.encrypt(blob).then((json) => {

          goal.blob = json;

          delete goal.type;
          delete goal.amount;
          delete goal.currency;
          delete goal.category;

          axios({
            url: '/api/v1/goals/' + goal.id,
            method: 'PUT',
            headers: {
              Authorization: 'Token ' + getState().user.token,
            },
            data: goal,
          })
            .then(response => {

              try {
                let goal = Object.assign({}, response.data, blob);
                delete goal.blob;

                storage.connectIndexedDB().then(connection => {
                  connection
                    .transaction('goals', 'readwrite')
                    .objectStore('goals')
                    .put(goal);

                  worker.onmessage = function(event) {
                    if (event.data.type === GOALS_READ_REQUEST) {
                      dispatch({
                        type: GOALS_READ_REQUEST,
                        goals: event.data.goals,
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
                    type: GOALS_READ_REQUEST,
                    account: getState().account.id,
                    selectedCurrency: getState().account.currency,
                  });
                });
              } catch (exception) {
                console.error(exception);
                reject(exception);
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

  delete: goal => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        axios({
          url: '/api/v1/goals/' + goal.id,
          method: 'DELETE',
          headers: {
            Authorization: 'Token ' + getState().user.token,
          },
        })
          .then(response => {
            storage.connectIndexedDB().then(connection => {
              connection
                .transaction('goals', 'readwrite')
                .objectStore('goals')
                .delete(goal.id);

              worker.onmessage = function(event) {
                if (event.data.type === GOALS_READ_REQUEST) {

                  dispatch({
                    type: GOALS_READ_REQUEST,
                    goals: event.data.goals,
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
                type: GOALS_READ_REQUEST,
                account: getState().account.id,
                selectedCurrency: getState().account.currency,
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

  export: (id) => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        worker.onmessage = function(event) {
          if (event.data.type === GOALS_EXPORT) {
            resolve({
              goals: event.data.goals
            });
          } else {
            console.error(event);
            reject(event);
          }
        };
        worker.postMessage({
          type: GOALS_EXPORT,
          account: id
        });
      });
    };
  },

  encrypt: (cipher, url, token) => {
    return new Promise((resolve, reject) => {
      worker.onmessage = function(event) {
        if (event.data.type === UPDATE_ENCRYPTION) {
          resolve();
        } else {
          console.error(event);
          reject(event);
        }
      };
      worker.postMessage({
        type: UPDATE_ENCRYPTION,
        cipher,
        url,
        token,
      });
    });
  },

  updateServerEncryption: (url, token, newCipher, oldCipher) => {
    return new Promise((resolve, reject) => {
      worker.onmessage = function(event) {
        if (event.data.type === ENCRYPTION_KEY_CHANGED) {
          resolve();
        } else {
          console.error(event);
          reject(event);
        }
      };
      worker.postMessage({
        type: ENCRYPTION_KEY_CHANGED,
        url,
        token,
        newCipher,
        oldCipher,
      });
    });
  },

  flush: () => {
    worker.postMessage({
      type: FLUSH,
    });
  },
};

export default GoalsActions;