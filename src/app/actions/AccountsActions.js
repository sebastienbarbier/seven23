import axios from "axios";

import {
  ACCOUNTS_SYNC_REQUEST,
  ACCOUNTS_UPDATE_REQUEST,
  ACCOUNTS_CREATE_REQUEST,
  ACCOUNTS_DELETE_REQUEST,
  ACCOUNTS_CURRENCY_REQUEST,
  ACCOUNTS_SWITCH_REQUEST,
  ACCOUNTS_IMPORT,
  ENCRYPTION_KEY_CHANGED,
  SERVER_LOADED,
  SERVER_SYNC,
  SERVER_SYNCED,
  SNACKBAR,
} from "../constants";

import { v4 as uuidv4 } from "uuid";
import encryption from "../encryption";

import TransactionActions from "./TransactionActions";
import ChangeActions from "./ChangeActions";
import CategoryActions from "./CategoryActions";

import Worker from "../workers/Accounts.worker";
const worker = new Worker();

var AccountsActions = {
  sync: () => {
    return (dispatch, getState) => {
      return axios({
        url: "/api/v1/accounts",
        method: "get",
        headers: {
          Authorization: "Token " + getState().user.token,
        },
      })
        .then(function (response) {
          const accounts = response.data;

          const promises = [];

          accounts.forEach((account) => {
            if (account.preferences) {
              promises.push(
                new Promise((resolve, reject) => {
                  encryption
                    .decrypt(account.preferences)
                    .then((json) => {
                      account.preferences = json;
                      resolve();
                    })
                    .catch(reject);
                })
              );
            }
          });

          return Promise.all(promises).then(() => {
            dispatch({
              type: ACCOUNTS_SYNC_REQUEST,
              accounts,
            });
            return Promise.resolve(accounts);
          });
        })
        .catch(function (ex) {
          return Promise.reject(ex);
        });
    };
  },

  create: (account) => {
    return (dispatch, getState) => {
      // Is account is local
      if (account.isLocal) {
        // Get lower id, and remove 1 with 0 hardcoded.
        if (!account.id) {
          account.id = uuidv4();
        }
        dispatch({
          type: ACCOUNTS_CREATE_REQUEST,
          account: account,
        });
        return Promise.resolve(account);
      } else {
        const non_encrypted_preferences = account.preferences;
        return encryption.encrypt(non_encrypted_preferences).then((json) => {
          account.preferences = json;
          // We push on server then update local instance with recieved id.
          return axios({
            url: "/api/v1/accounts",
            method: "POST",
            headers: {
              Authorization: "Token " + getState().user.token,
            },
            data: account,
          })
            .then((response) => {
              response.data.preferences = non_encrypted_preferences;
              dispatch({
                type: ACCOUNTS_CREATE_REQUEST,
                account: response.data,
              });
              return Promise.resolve(response.data);
            })
            .catch((error) => {
              return Promise.reject(error.response);
            });
        });
      }
    };
  },

  update: (account) => {
    return (dispatch, getState) => {
      if (account.isLocal) {
        dispatch({
          type: ACCOUNTS_UPDATE_REQUEST,
          account: account,
        });
        return Promise.resolve();
      } else {
        const non_encrypted_preferences = account.preferences;
        return encryption.encrypt(account.preferences).then((json) => {
          account.preferences = json;
          return axios({
            url: "/api/v1/accounts/" + account.id,
            method: "PATCH",
            headers: {
              Authorization: "Token " + getState().user.token,
            },
            data: account,
          })
            .then((response) => {
              const new_account = response.data;
              new_account.preferences = non_encrypted_preferences;
              dispatch({
                type: ACCOUNTS_UPDATE_REQUEST,
                account: new_account,
              });
              return Promise.resolve(new_account);
            })
            .catch((error) => {
              console.log("error", { error });
              return Promise.reject(error);
            });
        });
      }
    };
  },

  delete: (account) => {
    return (dispatch, getState) => {
      return Promise.all([
        CategoryActions.flush([account.id]),
        TransactionActions.flush([account.id]),
        ChangeActions.flush([account.id]),
      ]).then(() => {
        return new Promise((resolve, reject) => {
          if (account.isLocal) {
            if (getState().account.id == account.id) {
              const newAccount = [
                ...getState().accounts.remote,
                ...getState().accounts.local,
              ].find((item) => item.id != account.id);

              dispatch(AccountsActions.switchAccount(newAccount || null)).then(
                (_) => {
                  dispatch({
                    type: ACCOUNTS_DELETE_REQUEST,
                    account,
                  });
                  if (!newAccount) {
                    dispatch({ type: SERVER_SYNCED });
                  }
                  resolve();
                }
              );
            } else {
              dispatch({
                type: ACCOUNTS_DELETE_REQUEST,
                account,
              });
              resolve();
            }
          } else {
            if (getState().sync.counter > 0) {
              dispatch({
                type: SNACKBAR,
                snackbar: {
                  message:
                    "You cannot delete accounts because of unsynced modification.",
                },
              });
              resolve();
            } else {
              if (getState().account.id == account.id) {
                const newAccount = [
                  ...getState().accounts.remote,
                  ...getState().accounts.local,
                ].find((item) => item.id != account.id);

                dispatch(AccountsActions.switchAccount(newAccount || null));
                if (!newAccount) {
                  dispatch({ type: SERVER_SYNCED });
                }
              }
              return axios({
                url: "/api/v1/accounts/" + account.id,
                method: "DELETE",
                headers: {
                  Authorization: "Token " + getState().user.token,
                },
              })
                .then((response) => {
                  dispatch({
                    type: ACCOUNTS_DELETE_REQUEST,
                    account,
                  });
                  resolve();
                })
                .catch((error) => {
                  if (error.status === 204) {
                    dispatch({
                      type: ACCOUNTS_DELETE_REQUEST,
                      account,
                    });
                    resolve();
                  } else if (error.status !== 400) {
                    console.error(error);
                  }
                  reject(error.response);
                });
            }
          }
        });
      }).catch((exception) => {
        console.error(exception);
      });
    };
  },

  switchCurrency: (currency) => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        const transactions = getState().transactions;

        dispatch({
          type: ACCOUNTS_CURRENCY_REQUEST,
          currency: currency,
        });

        const account = getState().account;

        if (account.isLocal) {
          account.currency = currency.id;
          dispatch(AccountsActions.update(account));
        }
        dispatch(ChangeActions.refresh())
          .then(() => {
            return dispatch(TransactionActions.refresh(transactions));
          })
          .then(() => {
            dispatch({
              type: SERVER_LOADED,
            });
            resolve();
          })
          .catch(() => {
            dispatch({
              type: SERVER_LOADED,
            });
            resolve();
          });
      });
    };
  },

  migrate: (account) => {
    return (dispatch, getState) => {
      dispatch({
        type: SERVER_SYNC,
      });

      return dispatch(AccountsActions.export(account.id))
        .then((json) => {
          return dispatch(AccountsActions.import(json, !account.isLocal));
        })
        .then((newAccount) => {
          return dispatch(AccountsActions.delete(account)).then(() => {
            dispatch({
              type: SERVER_SYNCED,
            });
            return Promise.resolve();
          });
        })
        .catch((exception) => {
          dispatch({
            type: SERVER_SYNCED,
          });
          console.error(exception);
          return Promise.reject(exception);
        });
    };
  },

  // Dirty import script but works like a charm (except ... performances of course).
  import: (json, importOnDevice) => {
    return (dispatch, getState) => {
      let steps = 0;

      return new Promise((resolve, reject) => {
        const uuid = uuidv4();
        worker.onmessage = function (event) {
          if (uuid == event.data.uuid) {
            const { account, exception } = event.data;

            if (!exception) {
              if (account) {
                dispatch({
                  type: ACCOUNTS_CREATE_REQUEST,
                  account: account,
                });
              }
              Promise.all([
                TransactionActions.refresh(),
                ChangeActions.refresh(),
                CategoryActions.refresh(),
              ])
                .then(() => {
                  resolve(account);
                })
                .catch(() => {
                  reject();
                });
            } else {
              console.error(exception);
              reject(exception);
            }
          }
        };
        worker.onerror = function (exception) {
          console.log(exception);
          reject(exception);
        };
        worker.postMessage({
          uuid,
          type: ACCOUNTS_IMPORT,
          token: getState().user.token,
          url: getState().server.url,
          cipher: getState().user.cipher,
          json,
          isLocal: importOnDevice,
        });
      });
    };
  },

  refreshAccount: () => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        Promise.all([
          dispatch(ChangeActions.refresh()),
          dispatch(CategoryActions.refresh()),
        ])
          .then(() => {
            return dispatch(TransactionActions.refresh());
          })
          .then(() => {
            dispatch({
              type: SERVER_SYNCED,
            });
            resolve();
          })
          .catch(() => {
            dispatch({
              type: SERVER_SYNCED,
            });
            reject();
          });
      });
    };
  },

  switchAccount: (account, force = false) => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        if (!force && getState().sync.counter > 0) {
          dispatch({
            type: SNACKBAR,
            snackbar: {
              message:
                "You cannot switch account because of unsynced modification.",
            },
          });
          resolve();
        } else {
          dispatch({
            type: ACCOUNTS_SWITCH_REQUEST,
            account: account,
          });
          if (!account) {
            resolve();
            return;
          }

          Promise.all([
            dispatch(ChangeActions.refresh()),
            dispatch(CategoryActions.refresh()),
          ])
            .then(() => {
              return dispatch(TransactionActions.refresh());
            })
            .then(() => {
              dispatch({
                type: SERVER_SYNCED,
              });
              resolve();
            })
            .catch(() => {
              dispatch({
                type: SERVER_SYNCED,
              });
              reject();
            });
        }
      });
    };
  },

  export: (id) => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        const promises = [
          dispatch(TransactionActions.export(id)),
          dispatch(ChangeActions.export(id)),
          dispatch(CategoryActions.export(id)),
        ];

        Promise.all(promises)
          .then((args) => {
            const { accounts, server } = getState();
            const account = [...accounts.remote, ...accounts.local].find(
              (a) => a.id == id
            );

            resolve(
              Object.assign(
                {},
                ...args,
                { account },
                {
                  server: {
                    url: server.url,
                    name: server.name,
                    contact: server.contact,
                  },
                }
              )
            );
          })
          .catch((exception) => {
            console.error(exception);
            reject(exception);
          });
      });
    };
  },

  setPreferences: (preferences) => {
    return (dispatch, getState) => {
      const new_preferences = Object.assign(
        {},
        getState().account.preferences,
        preferences
      );
      const new_account = {
        id: getState().account.id,
        preferences: new_preferences,
      };
      return dispatch(AccountsActions.update(new_account));
    };
  },

  updateServerEncryption: (url, token, newCipher, oldCipher) => {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();
      worker.onmessage = function (event) {
        if (event.data.uuid == uuid) {
          resolve();
        }
      };
      worker.onerror = function (exception) {
        console.log(exception);
        reject(exception);
      };
      worker.postMessage({
        uuid,
        type: ENCRYPTION_KEY_CHANGED,
        url,
        token,
        newCipher,
        oldCipher,
      });
    });
  },
};

export default AccountsActions;