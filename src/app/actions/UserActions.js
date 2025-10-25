import axios from "axios";
import md5 from "blueimp-md5";
import encryption from "../encryption";

import AppActions from "./AppActions";
import CategoryActions from "./CategoryActions";
import ChangeActions from "./ChangeActions";
import TransactionActions from "./TransactionActions";

// Login stuff
import storage from "../storage";
import AccountsActions from "./AccountsActions";
import ServerActions from "./ServerActions";

import {
  SNACKBAR,
  UPDATE_ENCRYPTION,
  USER_CHANGE_THEME,
  USER_FETCH_PROFILE,
  USER_FETCH_TOKEN,
  USER_LOGIN,
  USER_LOGOUT,
  USER_LOGOUT_LOADING,
  USER_UPDATE_NETWORK,
  USER_UPDATE_REQUEST,
} from "../constants";

var UserActions = {
  setTheme: (theme = "light") => {
    if (theme !== "light" && theme !== "dark") {
      throw new Error("wrong args to UserActions.setTheme", theme);
    }
    return {
      type: USER_CHANGE_THEME,
      theme: theme,
    };
  },

  fetchToken: (username, password, recovering = false) => {
    return (dispatch, getState) => {
      return axios({
        url: "/api/api-token-auth",
        method: "POST",
        data: {
          username: username,
          password: password,
        },
      })
        .then((json) => {
          const { token } = json.data;
          const cipher = md5(password);

          if (!recovering) {
            encryption.key(cipher);
            dispatch({
              type: USER_FETCH_TOKEN,
              token,
              cipher,
            });
          }
          return Promise.resolve(token);
        })
        .catch((exception) => {
          return Promise.reject(exception);
        });
    };
  },

  fetchProfile: (token) => {
    return (dispatch, getState) => {
      token = token || getState().user.token;

      encryption.key(getState().user.cipher);
      return axios({
        url: "/api/v1/rest-auth/user/",
        method: "get",
        headers: {
          Authorization: "Token " + token,
        },
      })
        .then((response) => {
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
              .then((social_networks) => {
                dispatch({
                  type: USER_FETCH_PROFILE,
                  profile: response.data,
                  social_networks,
                });
                return Promise.resolve(response.data);
              })
              .catch((exception) => {
                return Promise.reject(exception);
              });
          } catch (exception) {
            return Promise.reject(exception);
          }
        })
        .catch((exception) => {
          return Promise.reject(exception);
        });
    };
  },

  logout: (force = false) => {
    return (dispatch, getState) => {
      return new Promise((resolve) => {
        if (!force && getState().sync.counter > 0) {
          dispatch(
            AppActions.snackbar(
              "You cannot logout because of unsynced modification.",
              "Force",
              () => {
                dispatch(UserActions.logout(true)).then(() => {
                  resolve();
                });
              }
            )
          );
        } else {
          dispatch({ type: USER_LOGOUT_LOADING });

          encryption.reset();

          const { account, accounts } = getState();
          const remote_accounts = getState().accounts.remote.map((c) => c.id);
          Promise.all([
            CategoryActions.flush(remote_accounts),
            TransactionActions.flush(remote_accounts),
            ChangeActions.flush(remote_accounts),
          ]).then((res) => {
            dispatch({ type: USER_LOGOUT });
            // If account is not local, we switch to a local.
            // AccountsActions.switchAccount() will set account to null
            if (!account.isLocal) {
              dispatch(AccountsActions.switchAccount(accounts.local[0], force));
            }
            resolve();
          });
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
          origin: origin,
        },
      })
        .then((response) => {
          return axios({
            url: "/api/v1/rest-auth/user/",
            method: "PATCH",
            headers: {
              Authorization: "Token " + response.data.key,
            },
            data: {
              first_name: first_name,
            },
          });
        })
        .catch(function (exception) {
          return Promise.reject(exception);
        });
    };
  },

  update: (user) => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        axios({
          url: "/api/v1/rest-auth/user/",
          method: "PATCH",
          headers: {
            Authorization: "Token " + getState().user.token,
          },
          data: user,
        })
          .then((json) => {
            dispatch({
              type: USER_UPDATE_REQUEST,
              profile: json.data,
            });
            resolve();
          })
          .catch((exception) => {
            console.error(exception);
            reject(exception.response.data);
          });
      });
    };
  },

  delete: (password) => {
    return (dispatch, getState) => {
      if (getState().user.cipher === md5(password)) {
        return axios({
          url: "/api/v1/user/delete",
          method: "DELETE",
          headers: {
            Authorization: "Token " + getState().user.token,
          },
          data: {
            password,
          },
        });
      } else {
        return Promise.reject({
          password: "Password incorrect",
        });
      }
    };
  },

  changeEmail: (data) => {
    return (dispatch, getState) => {
      return axios({
        url: "/api/v1/users/email",
        method: "POST",
        headers: {
          Authorization: "Token " + getState().user.token,
        },
        data: {
          email: data.email,
        },
      })
        .then((json) => {
          dispatch({
            type: USER_UPDATE_REQUEST,
            profile: json.data,
          });
        })
        .catch((error) => {
          return Promise.reject(error.response.data);
        });
    };
  },

  changePassword: (data) => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        if (getState().sync.counter > 0) {
          dispatch({
            type: SNACKBAR,
            snackbar: {
              message:
                "Password update failed because of unsynced modification. Sync then try again.",
            },
          });
          resolve();
        } else {
          axios({
            url: "/api/v1/rest-auth/password/change/",
            method: "POST",
            headers: {
              Authorization: "Token " + getState().user.token,
            },
            data: data,
          })
            .then((response) => {
              // Update user cipher
              const cipher = md5(data.new_password1);
              const old_cipher = getState().user.cipher;

              const { token } = getState().user;
              encryption.key(cipher);
              dispatch({
                type: UPDATE_ENCRYPTION,
                cipher,
              });

              dispatch(
                UserActions.updateServerEncryption(token, cipher, old_cipher)
              )
                .then((_) => {
                  resolve();
                })
                .catch((_) => {
                  reject();
                });
            })
            .catch((error) => {
              console.error(error);
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
                "You cannot revoke token because of unsynced modification.",
            },
          });
          resolve();
        } else {
          axios({
            url: "/api/v1/users/token",
            method: "DELETE",
            headers: {
              Authorization: "Token " + getState().user.token,
            },
          })
            .then((response) => {
              dispatch(UserActions.logout(true));
              resolve();
            })
            .catch((exception) => {
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
        AccountsActions.updateServerEncryption(
          url,
          token,
          newCipher,
          oldCipher
        ),
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
        ChangeActions.updateServerEncryption(url, token, newCipher, oldCipher),
        new Promise((resolve, reject) => {
          axios({
            url: "/api/v1/rest-auth/user/",
            method: "get",
            headers: {
              Authorization: "Token " + token,
            },
          })
            .then(function (response) {
              if (
                response.data.profile &&
                !response.data.profile.social_networks
              ) {
                resolve();
              } else {
                encryption
                  .key(oldCipher)
                  .then(() => {
                    return encryption.decrypt(
                      response.data.profile.social_networks
                    );
                  })
                  .then((json) => {
                    return encryption.key(newCipher).then(() => {
                      return Promise.resolve(json);
                    });
                  })
                  .then((json) => {
                    return encryption.encrypt(json);
                  })
                  .then((encrypted_json) => {
                    return axios({
                      url: "/api/v1/rest-auth/user/",
                      method: "PATCH",
                      headers: {
                        Authorization: "Token " + getState().user.token,
                      },
                      data: { profile: { social_networks: encrypted_json } },
                    });
                  })
                  .then(() => {
                    resolve();
                  })
                  .catch((exception) => {
                    console.error(exception);
                    reject(exception);
                  });
              }
            })
            .catch((exception) => {
              console.error(exception);
              reject(exception);
            });
        }),
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
                    .then((profile) => {
                      if (profile) {
                        dispatch(AccountsActions.sync())
                          .then((accounts) => {
                            // If after init user has no account, we redirect ot create one.
                            dispatch(ServerActions.sync(true))
                              .then(() => {
                                dispatch({
                                  type: USER_LOGIN,
                                });
                                resolve();
                              })
                              .catch((exception) => {
                                console.error(exception);
                                reject(exception);
                              });
                          })
                          .catch((exception) => {
                            console.error(exception);
                            reject(exception);
                          });
                      } else {
                        reject("No Profile returned by fetchProfile");
                      }
                    })
                    .catch((exception) => {
                      console.error(exception);
                      reject(exception);
                    });
                } else {
                  reject("no token and ni cipher or already profiled");
                }
              })
              .catch((exception) => {
                reject("no token and ni cipher or already profiled");
              });
          })
          .catch((exception) => {
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
          description,
        },
        headers: {
          Authorization: "Token " + getState().user.token,
        },
      });
    };
  },

  coupon: (product_id, coupon_code) => {
    return (dispatch, getState) => {
      return axios({
        url: `/api/v1/coupon/${product_id}/${coupon_code}`,
        method: "GET",
        headers: {
          Authorization: "Token " + getState().user.token,
        },
      }).then((result) => {
        return Promise.resolve({
          coupon_id: result.data.coupon_id,
          price: result.data.price,
        });
      });
    };
  },

  refreshNomadlist: () => {
    return (dispatch, getState) => {
      if (
        getState().user.socialNetworks &&
        getState().user.socialNetworks.nomadlist &&
        getState().user.socialNetworks.nomadlist.username
      ) {
        return dispatch(
          UserActions.updateNomadlist(
            getState().user.socialNetworks.nomadlist.username
          )
        );
      } else {
        return Promise.resolve();
      }
    };
  },

  updateNomadlist: (username) => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        if (username) {
          let lastSynced = 0;
          if (
            getState().user.socialNetworks &&
            getState().user.socialNetworks.nomadlist
          ) {
            lastSynced = getState().user.socialNetworks.nomadlist.lastSynced;
          }
          if (new Date() - new Date(lastSynced) < 100 * 60 * 15) {
            resolve();
          } else {
            axios({
              url: `https://nomadlist.com/@${username}.json`,
              method: "GET",
            })
              .then((result) => {
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
                  // Fix data with wrong country code for UK and GB
                  if (result.data && result.data.trips) {
                    result.data.trips.forEach((trip) => {
                      if (trip.country_code === "UK") {
                        trip.country_code = "GB";
                      }
                    });
                  }

                  // Store and save
                  dispatch({
                    type: USER_UPDATE_NETWORK,
                    socialNetworks: {
                      nomadlist: {
                        username: username,
                        lastSynced: new Date(),
                        data: result.data,
                      },
                    },
                  });

                  if (getState().server.isLogged) {
                    // Update profile on server to share between all instances
                    encryption
                      .encrypt(getState().user.socialNetworks)
                      .then((social_networks) => {
                        dispatch(
                          UserActions.update({ profile: { social_networks } })
                        )
                          .then(() => {
                            resolve();
                          })
                          .catch((exception) => {
                            console.error(exception);
                            reject();
                          });
                      })
                      .catch((exception) => {
                        console.error(exception);
                        reject();
                      });
                  } else {
                    resolve();
                  }
                }
              })
              .catch((exception) => {
                console.error(exception);
                reject();
              });
          }
        } else {
          dispatch({
            type: USER_UPDATE_NETWORK,
            socialNetworks: {
              nomadlist: null,
            },
          });
          if (getState().server.isLogged) {
            encryption
              .encrypt(getState().user.socialNetworks)
              .then((social_networks) => {
                dispatch(UserActions.update({ profile: { social_networks } }))
                  .then(() => {
                    resolve();
                  })
                  .catch((exception) => {
                    console.error(exception);
                    reject();
                  });
              })
              .catch((exception) => {
                console.error(exception);
                reject();
              });
          }
        }
      });
    };
  },

  setBackupKey: (isBackedUp = true) => {
    return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
        axios({
          url: "/api/v1/rest-auth/user/",
          method: "PATCH",
          headers: {
            Authorization: "Token " + getState().user.token,
          },
          data: {
            profile: {
              key_verified: isBackedUp,
            },
          },
        })
          .then((json) => {
            dispatch({
              type: USER_UPDATE_REQUEST,
              profile: json.data,
            });
            resolve();
          })
          .catch((exception) => {
            console.error(exception);
            reject(exception.response.data);
          });
      });
    };
  },

  toggleAutoSync: () => {},
};

export default UserActions;
