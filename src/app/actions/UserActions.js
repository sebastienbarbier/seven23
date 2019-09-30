import axios from "axios";
import md5 from "blueimp-md5";
import encryption from "../encryption";

import CategoryActions from "./CategoryActions";
import TransactionActions from "./TransactionActions";
import ChangeActions from "./ChangeActions";

// Login stuff
import AccountsActions from "./AccountsActions";
import ServerActions from "./ServerActions";
import storage from "../storage";

import {
  USER_LOGIN,
  USER_LOGOUT,
  USER_UPDATE_REQUEST,
  USER_FETCH_TOKEN,
  USER_FETCH_PROFILE,
  USER_CHANGE_THEME,
  USER_UPDATE_NETWORK,
  UPDATE_ENCRYPTION,
  SNACKBAR
} from "../constants";

var UserActions = {
  setTheme: (theme = "light") => {
    if (theme !== "light" && theme !== "dark") {
      throw new Error("wrong args to UserActions.setTheme", theme);
    }
    return {
      type: USER_CHANGE_THEME,
      theme: theme
    };
  },

  fetchToken: (username, password, recovering = false) => {
    return (dispatch, getState) => {
      return axios({
        url: "/api/api-token-auth",
        method: "POST",
        data: {
          username: username,
          password: password
        }
      })
        .then(json => {
          const { token } = json.data;
          const cipher = md5(password);

          if (!recovering) {
            encryption.key(cipher);
            dispatch({
              type: USER_FETCH_TOKEN,
              token,
              cipher
            });
          }
          return Promise.resolve(token);
        })
        .catch(exception => {
          return Promise.reject(exception);
        });
    };
  },

  fetchProfile: token => {
    return (dispatch, getState) => {
      token = token || getState().user.token;

      encryption.key(getState().user.cipher);
      return axios({
        url: "/api/v1/rest-auth/user/",
        method: "get",
        headers: {
          Authorization: "Token " + token
        }
      })
        .then(response => {
          let promise = Promise.resolve();
          try {
            if (
              response.data.profile &&
              response.data.profile.social_networks
            ) {
              promise = encryption.decrypt(
                response.data.profile.social_networks
              );
            }
            return promise
              .then(social_networks => {
                dispatch({
                  type: USER_FETCH_PROFILE,
                  profile: response.data,
                  social_networks
                });
                return Promise.resolve(response.data);
              })
              .catch(exception => {
                return Promise.reject(exception);
              });
          } catch (exception) {
            reject(exception);
          }
        })
        .catch(exception => {
          return Promise.reject(exception);
        });
    };
  },

  logout: (force = false) => {
    return (dispatch, getState) => {
      return new Promise(resolve => {
        if (!force && getState().sync.counter > 0) {
          dispatch({
            type: SNACKBAR,
            snackbar: {
              message: "You cannot logout because of unsynced modification."
            }
          });
          resolve();
        } else {
          encryption.reset();

          if (!getState().account.isLocal) {
            dispatch(
              AccountsActions.switchAccount(getState().accounts.local[0])
            );
          }
          CategoryActions.flush(getState().accounts.remote.map(c => c.id));
          TransactionActions.flush(getState().accounts.remote.map(c => c.id));
          ChangeActions.flush(getState().accounts.remote.map(c => c.id));

          dispatch({ type: USER_LOGOUT });
          resolve();
        }
      });
    };
  },

  create: (username, first_name, email, password1, password2, origin) => {
    return (dispatch, getState) => {
      return axios({
        url: "/api/v1/rest-auth/registration/",
        method: "POST",
        data: {
          username: username,
          email: email,
          password1: password1,
          password2: password2,
          origin: origin
        }
      })
        .then(response => {
          return axios({
            url: "/api/v1/rest-auth/user/",
            method: "PATCH",
            headers: {
              Authorization: "Token " + response.data.key
            },
            data: {
              first_name: first_name
            }
          });
        })
        .catch(function(exception) {
          return Promise.reject(exception);
        });
    };
  },

  update: user => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        axios({
          url: "/api/v1/rest-auth/user/",
          method: "PATCH",
          headers: {
            Authorization: "Token " + getState().user.token
          },
          data: user
        })
          .then(json => {
            dispatch({
              type: USER_UPDATE_REQUEST,
              profile: json.data
            });
            resolve();
          })
          .catch(exception => {
            console.error(exception);
            reject(exception.response.data);
          });
      });
    };
  },

  delete: user => {
    return (dispatch, getState) => {
      return axios({
        url: "/api/v1/users/" + user.id,
        method: "DELETE",
        headers: {
          Authorization: "Token " + getState().user.token
        },
        data: user
      })
        .then(json => {
          dispatch(UserActions.logout());
        })
        .catch(exception => {
          console.error(exception);
        });
    };
  },

  changeEmail: data => {
    return (dispatch, getState) => {
      return axios({
        url: "/api/v1/users/email",
        method: "POST",
        headers: {
          Authorization: "Token " + getState().user.token
        },
        data: {
          email: data.email
        }
      })
        .then(json => {
          dispatch({
            type: USER_UPDATE_REQUEST,
            profile: json.data
          });
        })
        .catch(error => {
          return Promise.reject(error.response.data);
        });
    };
  },

  changePassword: data => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        if (getState().sync.counter > 0) {
          dispatch({
            type: SNACKBAR,
            snackbar: {
              message:
                "Password update failed because of unsynced modification. Sync then try again."
            }
          });
          resolve();
        } else {
          axios({
            url: "/api/v1/rest-auth/password/change/",
            method: "POST",
            headers: {
              Authorization: "Token " + getState().user.token
            },
            data: data
          })
            .then(response => {
              // Update user cipher
              const cipher = md5(data.new_password1);

              const { token } = getState().user;
              const { url } = getState().server;
              encryption.key(cipher);
              dispatch({
                type: UPDATE_ENCRYPTION,
                cipher
              });

              // Encrypt all data with new cipher
              // TODO
              Promise.all([
                CategoryActions.encrypt(cipher, url, token),
                TransactionActions.encrypt(cipher, url, token),
                ChangeActions.encrypt(cipher, url, token)
              ])
                .then(_ => {
                  resolve();
                })
                .catch(_ => {
                  reject();
                });
            })
            .catch(error => {
              reject(error.response.data);
            });
        }
      });
    };
  },

  revokeToken: () => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        if (getState().sync.counter > 0) {
          dispatch({
            type: SNACKBAR,
            snackbar: {
              message:
                "You cannot revoke token because of unsynced modification."
            }
          });
          resolve();
        } else {
          axios({
            url: "/api/v1/users/token",
            method: "DELETE",
            headers: {
              Authorization: "Token " + getState().user.token
            }
          })
            .then(response => {
              dispatch(UserActions.logout());
              resolve();
            })
            .catch(exception => {
              console.error(exception);
              reject(exception);
            });
        }
      });
    };
  },

  updateServerEncryption: (token, newCipher, oldCipher) => {
    return (dispatch, getState) => {
      const url = getState().server.url;
      return Promise.all([
        CategoryActions.updateServerEncryption(
          url,
          token,
          newCipher,
          oldCipher
        ),
        TransactionActions.updateServerEncryption(
          url,
          token,
          newCipher,
          oldCipher
        ),
        ChangeActions.updateServerEncryption(url, token, newCipher, oldCipher)
      ]);
    };
  },

  login: () => {
    return (dispatch, getState) => {
      const url = getState().server.url;

      return new Promise((resolve, reject) => {
        dispatch(ServerActions.connect(url))
          .then(() => {
            // connect storage to indexedDB
            return storage
              .connectIndexedDB()
              .then(() => {
                const user = getState().user;
                if (user.token && user.cipher) {
                  dispatch(UserActions.fetchProfile())
                    .then(profile => {
                      if (profile) {
                        dispatch(AccountsActions.sync())
                          .then(accounts => {
                            // If after init user has no account, we redirect ot create one.
                            dispatch(ServerActions.sync(true))
                              .then(() => {
                                dispatch({
                                  type: USER_LOGIN
                                });
                                resolve();
                              })
                              .catch(exception => {
                                reject();
                              });
                          })
                          .catch(exception => {
                            reject();
                          });
                      } else {
                        reject();
                      }
                    })
                    .catch(exception => {
                      reject();
                    });
                } else {
                  reject("no token and ni cipher or already profiled");
                }
              })
              .catch(exception => {
                reject("no token and ni cipher or already profiled");
              });
          })
          .catch(exception => {
            reject("no token and ni cipher or already profiled");
          });
      });
    };
  },

  pay: (
    token,
    product_id,
    coupon_code = undefined,
    description = "No description"
  ) => {
    return (dispatch, getState) => {
      return axios({
        url: "/api/v1/payment",
        method: "POST",
        data: {
          token: token,
          product_id,
          coupon_code,
          description
        },
        headers: {
          Authorization: "Token " + getState().user.token
        }
      });
    };
  },

  coupon: (product_id, coupon_code) => {
    return (dispatch, getState) => {
      return axios({
        url: `/api/v1/coupon/${product_id}/${coupon_code}`,
        method: "GET",
        headers: {
          Authorization: "Token " + getState().user.token
        }
      }).then(result => {
        return Promise.resolve({
          coupon_id: result.data.coupon_id,
          price: result.data.price
        });
      });
    };
  },

  updateNomadlist: username => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        if (username) {
          axios({
            url: `https://nomadlist.com/@${username}.json`,
            method: "GET"
          })
            .then(result => {
              if (result.data.username !== `@${username}`) {
                console.error(
                  `Nomadlist returned ${result.data.username} instead of @${username}`
                );
                reject(
                  new Error(
                    "Nomadlist returned a corrupted profil, please try again later."
                  )
                );
              } else {
                dispatch({
                  type: USER_UPDATE_NETWORK,
                  socialNetworks: {
                    nomadlist: {
                      username: username,
                      lastSynced: new Date(),
                      data: result.data
                    }
                  }
                });

                if (getState().server.isLogged) {
                  // Update profile on server to share between all instances
                  encryption
                    .encrypt(getState().user.socialNetworks)
                    .then(social_networks => {
                      dispatch(
                        UserActions.update({ profile: { social_networks } })
                      )
                        .then(() => {
                          resolve();
                        })
                        .catch(exception => {
                          console.error(exception);
                          reject();
                        });
                    })
                    .catch(exception => {
                      console.error(exception);
                      reject();
                    });
                } else {
                  resolve();
                }
              }
            })
            .catch(exception => {
              console.error(exception);
              reject();
            });
        } else {
          dispatch({
            type: USER_UPDATE_NETWORK,
            socialNetworks: {
              nomadlist: null
            }
          });
          if (getState().server.isLogged) {
            encryption
              .encrypt(getState().user.socialNetworks)
              .then(social_networks => {
                dispatch(UserActions.update({ profile: { social_networks } }))
                  .then(() => {
                    resolve();
                  })
                  .catch(exception => {
                    console.error(exception);
                    reject();
                  });
              })
              .catch(exception => {
                console.error(exception);
                reject();
              });
          }
        }
      });
    };
  }
};

export default UserActions;
