import axios from "axios";

import storage from "../storage";
import encryption from "../encryption";

import {
  CATEGORIES_READ_REQUEST,
  CATEGORIES_CREATE_REQUEST,
  CATEGORIES_UPDATE_REQUEST,
  CATEGORIES_DELETE_REQUEST,
  CATEGORIES_EXPORT,
  SERVER_LAST_EDITED,
  UPDATE_ENCRYPTION,
  ENCRYPTION_KEY_CHANGED,
  DB_NAME,
  DB_VERSION,
  FLUSH
} from "../constants";

import Worker from "../workers/Categories.worker";

const worker = new Worker();

var CategoryActions = {
  sync: () => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        const sync_categories = getState().sync.categories;

        const create_promise = new Promise((resolve, reject) => {
          if (sync_categories.create && sync_categories.create.length) {
            // UPDATE CATEGORIES
            function recursiveCategoryImport(create_list) {
              return new Promise((resolve, reject) => {
                if (create_list.length === 0) {
                  resolve();
                  return;
                }

                const promises = [];
                const categories = [];
                const categories_left = [];
                // For each category in create_list
                //  If parent is null or not in createList, we can update.
                create_list.forEach(id => {
                  const category = getState().categories.list.find(
                    c => c.id == id
                  );
                  if (
                    !category.parent ||
                    create_list.indexOf(category.parent) === -1
                  ) {
                    promises.push(
                      new Promise((resolve2, reject2) => {
                        const blob = {};
                        blob.name = category.name;
                        blob.description = category.description;
                        if (category.parent) {
                          blob.parent = category.parent;
                        }
                        encryption
                          .encrypt(blob)
                          .then(json2 => {
                            category.blob = json2;
                            delete category.name;
                            delete category.description;
                            delete category.parent;
                            delete category.children;
                            categories.push(category);
                            resolve2();
                          })
                          .catch(reject2);
                      })
                    );
                  } else {
                    categories_left.push(id);
                  }
                });

                Promise.all(promises)
                  .then(() => {
                    if (categories.length === 0) {
                      recursiveCategoryImport(categories_left)
                        .then(() => {
                          resolve();
                        })
                        .catch(exception => {
                          reject(exception);
                        });
                    } else {
                      axios({
                        url: "/api/v1/categories",
                        method: "POST",
                        headers: {
                          Authorization: "Token " + getState().user.token
                        },
                        data: categories
                      })
                        .then(response => {
                          const local_promises = [];
                          response.data.forEach(category => {
                            local_promises.push(
                              new Promise((resolve3, reject3) => {
                                const old_category = categories.find(
                                  c => c.blob && c.blob === category.blob
                                );

                                create_list.indexOf(category.parent);

                                encryption
                                  .decrypt(category.blob)
                                  .then(json2 => {
                                    delete category.blob;

                                    category = Object.assign(
                                      {},
                                      category,
                                      json2
                                    );

                                    // Update categories parent refrence with new category id
                                    getState().categories.list.forEach(c2 => {
                                      if (
                                        parseInt(c2.parent) ===
                                        parseInt(old_category.id)
                                      ) {
                                        c2.parent = parseInt(category.id);
                                      }
                                    });

                                    // Update transaction reference with new cateogry id
                                    getState().transactions.forEach(
                                      transaction => {
                                        if (
                                          parseInt(transaction.category) ===
                                          parseInt(old_category.id)
                                        ) {
                                          transaction.category = parseInt(
                                            category.id
                                          );
                                        }
                                      }
                                    );
                                    resolve3();
                                  })
                                  .catch(reject3);
                              })
                            );
                          });
                          Promise.all(local_promises)
                            .then(() => {
                              recursiveCategoryImport(categories_left)
                                .then(resolve)
                                .catch(reject);
                            })
                            .catch(reject);
                        })
                        .catch(reject);
                    }
                  })
                  .catch(exception => {
                    reject(exception);
                  });
              });
            }

            recursiveCategoryImport(sync_categories.create)
              .then(() => {
                storage
                  .connectIndexedDB()
                  .then(connection => {
                    var customerObjectStore = connection
                      .transaction("categories", "readwrite")
                      .objectStore("categories");

                    // Delete previous non synced objects
                    sync_categories.create.forEach(id => {
                      customerObjectStore.delete(id);
                    });

                    resolve();
                  })
                  .catch(exception => {
                    console.error(exception);
                    reject(exception);
                  });
              })
              .catch(exception => {
                reject(exception);
              });
          } else {
            resolve();
          }
        });
        const delete_promise = new Promise((resolve, reject) => {
          if (sync_categories.delete && sync_categories.delete.length) {
            if (sync_categories.delete && sync_categories.delete.length) {
              axios({
                url: "/api/v1/categories",
                method: "DELETE",
                headers: {
                  Authorization: "Token " + getState().user.token
                },
                data: sync_categories.delete
              })
                .then(response => {
                  resolve();
                })
                .catch(error => {
                  console.error(error);
                  reject(error.response);
                });
            } else {
              resolve();
            }
          } else {
            resolve();
          }
        });

        Promise.all([create_promise, delete_promise]).then(() => {
          // After creating and deleting, we can update existing categories with latest Id's
          const update_promise = new Promise((resolve, reject) => {
            if (sync_categories.update && sync_categories.update.length) {
              const promises = [];
              const categories = [];

              getState()
                .categories.list.filter(
                  c => sync_categories.update.indexOf(c.id) != -1
                )
                .forEach(category => {
                  promises.push(
                    new Promise(resolve => {
                      const blob = {};
                      blob.name = category.name;
                      blob.description = category.description;
                      if (category.parent === null) {
                        delete category.parent;
                      } else {
                        blob.parent = category.parent;
                      }

                      encryption.encrypt(blob).then(json => {
                        category.blob = json;
                        delete category.name;
                        delete category.description;
                        delete category.parent;

                        categories.push(category);
                        resolve();
                      });
                    })
                  );
                });

              Promise.all(promises)
                .then(() => {
                  axios({
                    url: "/api/v1/categories",
                    method: "PUT",
                    headers: {
                      Authorization: "Token " + getState().user.token
                    },
                    data: categories
                  })
                    .then(response => {
                      resolve();
                    })
                    .catch(error => {
                      return reject(error.response);
                    });
                })
                .catch(exception => {
                  reject(exception);
                });
            } else {
              resolve();
            }
          });

          update_promise.then(() => {
            const { last_edited } = getState().server;
            let url = "/api/v1/categories";
            if (last_edited) {
              url = url + "?last_edited=" + last_edited;
            }

            axios({
              url: url,
              method: "get",
              headers: {
                Authorization: "Token " + getState().user.token
              }
            }).then(function(response) {
              if (
                (!last_edited && response.data.length === 0) ||
                !getState().account.id
              ) {
                dispatch({
                  type: CATEGORIES_READ_REQUEST,
                  list: [],
                  tree: []
                });
                resolve();
              } else {
                // Load transactions store
                storage
                  .connectIndexedDB()
                  .then(connection => {
                    var customerObjectStore = connection
                      .transaction("categories", "readwrite")
                      .objectStore("categories");

                    let { last_edited } = getState().server;

                    // Delete all previous objects
                    if (!last_edited) {
                      customerObjectStore.clear();
                    }

                    const addObject = i => {
                      var obj = i.next();
                      if (obj && obj.value && obj.value[1].deleted) {
                        obj = obj.value[1];
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
                        if (obj && obj.value) {
                          obj = obj.value[1];

                          encryption
                            .decrypt(obj.blob === "" ? "{}" : obj.blob)
                            .then(json => {
                              obj = Object.assign({}, obj, json);
                              delete obj.blob;

                              if (obj.name) {
                                if (
                                  !last_edited ||
                                  obj.last_edited > last_edited
                                ) {
                                  last_edited = obj.last_edited;
                                }

                                const saveObject = obj => {
                                  var request = customerObjectStore.put(obj);
                                  request.onsuccess = function(event) {
                                    addObject(i);
                                  };
                                  request.onerror = function(event) {
                                    console.error(event);
                                    reject(event);
                                  };
                                };

                                try {
                                  saveObject(obj);
                                } catch (exception) {
                                  if (exception instanceof DOMException) {
                                    customerObjectStore = connection
                                      .transaction("categories", "readwrite")
                                      .objectStore("categories");
                                    saveObject(obj);
                                  } else {
                                    reject(exception);
                                  }
                                }
                              } else {
                                addObject(i);
                              }
                            })
                            .catch(exception => {
                              console.error(exception);
                              reject(exception);
                            });
                        } else {
                          worker.onmessage = function(event) {
                            // Receive message { type: ..., categoriesList: ..., categoriesTree: ... }
                            if (event.data.type === CATEGORIES_READ_REQUEST) {
                              dispatch({
                                type: SERVER_LAST_EDITED,
                                last_edited: last_edited
                              });
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
        let maxId = 0;
        getState().categories.list.forEach(
          category => (maxId = category.id > maxId ? category.id : maxId)
        );

        category.id = maxId + 1;
        category.account = getState().account.id;
        category.active = true;
        category.deleted = false;

        storage.connectIndexedDB().then(connection => {
          connection
            .transaction("categories", "readwrite")
            .objectStore("categories")
            .put(category);

          dispatch({
            type: CATEGORIES_CREATE_REQUEST,
            category
          });

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
    };
  },

  update: category => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        category.active = true;
        category.deleted = false;

        storage.connectIndexedDB().then(connection => {
          connection
            .transaction("categories", "readwrite")
            .objectStore("categories")
            .put(category);

          dispatch({
            type: CATEGORIES_UPDATE_REQUEST,
            category
          });

          console.log(category);
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
    };
  },

  delete: id => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        const category = getState().categories.list.find(c => c.id === id);

        let connectDB = indexedDB.open(DB_NAME, DB_VERSION);
        connectDB.onsuccess = function(event) {
          var customerObjectStore = event.target.result
            .transaction("categories", "readwrite")
            .objectStore("categories");

          var request;
          if (getState().transactions.find(t => t.category === id)) {
            category.active = false;
            request = customerObjectStore.put(category);
          } else {
            request = customerObjectStore.delete(id);
          }

          request.onsuccess = function(event) {
            dispatch({
              type: CATEGORIES_DELETE_REQUEST,
              id: id
            });

            //
            const categories = getState().categories.list.filter(
              c => c.parent === id
            );

            categories.forEach(c => {
              c.parent = category.parent;
              customerObjectStore.put(c);
              dispatch({ type: CATEGORIES_UPDATE_REQUEST, category: c });
            });

            dispatch(CategoryActions.refresh())
              .then(() => {
                resolve();
              })
              .catch(() => {
                reject();
              });
          };
          request.onerror = function(event) {
            console.error(event);
            reject(event);
          };
        };
      });
    };
  },

  export: id => {
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
        token
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
        oldCipher
      });
    });
  },

  flush: () => {
    worker.postMessage({
      type: FLUSH
    });
  }
};

export default CategoryActions;
