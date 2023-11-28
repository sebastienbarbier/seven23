import axios from "axios";

import {
  API_DEFAULT_URL,
  SERVER_CONNECTING,
  SERVER_CONNECT,
  SERVER_CONNECT_FAIL,
  SERVER_INIT,
  SERVER_SYNC,
  SERVER_SYNCED,
  SERVER_UNDER_MAINTENANCE,
  SERVER_ERROR,
  SERVER_ADD,
  SERVER_REMOVE,
  USER_LOGOUT,
  SNACKBAR,
} from "../constants";

import AccountsActions from "./AccountsActions";
import TransactionsActions from "./TransactionActions";
import CategoriesActions from "./CategoryActions";
import CurrenciesActions from "./CurrenciesActions";
import ChangesActions from "./ChangeActions";
import UserActions from "./UserActions";

// Shared server process between init and connect.
const processData = (server, url = API_DEFAULT_URL) => {
  server.url = url;
  server.name = url
    .replace("http://", "")
    .replace("https://", "")
    .split(/[/?#]/)[0];

  if (server.name === "api.seven23.io") {
    server.isOfficial = true;
    server.name = 'Seven23.io'
  } else {
    server.isOfficial = false;
  }
  return server;
}

let timer;
const ServerActions = {
  connect: (url = API_DEFAULT_URL) => {
    return (dispatch, getState) => {
      // Default default url in axios
      axios.defaults.baseURL = url;

      dispatch({
        type: SERVER_CONNECTING,
        url,
      });

      return axios({
        url: "/api/init",
        method: "get",
      })
        .then((response) => {
          const server = processData(response.data, url);
          dispatch({
            type: SERVER_CONNECT,
            server,
          });
          return Promise.resolve(server);
        })
        .catch(function (ex) {
          dispatch({
            type: SERVER_CONNECT_FAIL,
            server: getState().server
          });
          throw new Error(ex);
        });
    };
  },

  init: () => {
    return (dispatch, getState) => {

      // Default default url in axios
      axios.defaults.baseURL = getState().server.url;

      dispatch({
        type: SERVER_CONNECTING,
        url: getState().server.url
      });
      return axios({
        url: "/api/init",
        method: "get",
      })
        .then((response) => {
          const server = processData(response.data, getState().server.url);
          dispatch({
            type: SERVER_INIT,
            server,
          });
          return Promise.resolve(server);
        })
        .catch(function (ex) {
          // throw new Error(ex);
          dispatch({
            type: SERVER_CONNECT_FAIL,
            server: getState().server
          });
        });
    };
  },

  subscribe: (price) => {
    return (dispatch, getState) => {
      return axios({
        url: "/api/v1/stripe/session",
        method: "get",
        headers: {
          Authorization: "Token " + getState().user.token,
        },
        params: {
          price_id: price.pk,
          success_url: window.location.href,
          cancel_url: window.location.href,
        }
      }).then((response) => {
          return Promise.resolve(response.data.session_id.url);
        })
        .catch(function (ex) {
          console.error(ex);
          dispatch({
            type: SNACKBAR,
            snackbar: {
              message: "Subscription failed. Please try again later.",
            },
          });
        });

    };
  },

  sync: (force = false) => {
    return (dispatch, getState) => {
      if (!force && !getState().server.isLogged) {
        return dispatch(AccountsActions.refreshAccount());
      } else if (!getState().state.isSyncing) {
        dispatch({
          type: SERVER_SYNC,
        });
        return Promise.all([
          dispatch(UserActions.refreshNomadlist()),
          dispatch(AccountsActions.sync()),
        ])
          .then(() => {
            return Promise.all([
              dispatch(ServerActions.init()),
              dispatch(UserActions.fetchProfile()),
              dispatch(CurrenciesActions.sync()),
              dispatch(CategoriesActions.sync()),
            ])
              .then(() => {
                return dispatch(ChangesActions.sync());
              })
              .then(() => {
                return dispatch(TransactionsActions.sync());
              })
              .then((_) => {
                return dispatch({
                  type: SERVER_SYNCED,
                });
              });
          })
          .catch((exception) => {
            if (getState().state.isLogging) {
              dispatch({
                type: USER_LOGOUT,
              });
            } else {
              console.error(exception);
              dispatch({
                type: SERVER_ERROR,
              });
              dispatch({
                type: SNACKBAR,
                snackbar: {
                  message: "Server sync just failed. Please try again later.",
                },
              });
            }
          });
      }
    };
  },

  maintenance: () => {
    return (dispatch, getState) => {
      if (!timer) {
        timer = setTimeout(() => {
          clearTimeout(timer);
        }, 4000);
        dispatch({
          type: SERVER_UNDER_MAINTENANCE,
        });
        dispatch({
          type: SNACKBAR,
          snackbar: {
            message:
              "Sorry, server is currently under maintenance. Please try again later.",
          },
        });
      }
      return Promise.resolve();
    };
  },
  add: (url) => {
    return {
      type: SERVER_ADD,
      url,
    };
  },
  remove: (url) => {
    return (dispatch, getState) => {
      dispatch({
        type: SERVER_REMOVE,
        url,
      });
      dispatch(ServerActions.connect(getState().server.url));
    };
  },
  error: (exception) => {
    return (dispatch, getState) => {
      if (!timer) {
        timer = setTimeout(() => {
          clearTimeout(timer);
        }, 4000);

        dispatch({
          type: SERVER_ERROR,
          status: exception ? exception.status : "",
          message: exception ? exception.statusText : "",
        });

        if (
          getState().user &&
          getState().user.profile &&
          new Date(getState().user.profile.valid_until) < new Date()
        ) {
          dispatch({
            type: SNACKBAR,
            snackbar: {
              message: "Sync failed because of expired subscription",
            },
          });
        } else if (!exception) {
          dispatch({
            type: SNACKBAR,
            snackbar: {
              message: "Server is not responding, please try again later.",
            },
          });
        } else {
          dispatch({
            type: SNACKBAR,
            snackbar: {
              message: "An unexpected error occured, please try again later.",
            },
          });
        }
      }
      return Promise.resolve();
    };
  },
};

export default ServerActions;