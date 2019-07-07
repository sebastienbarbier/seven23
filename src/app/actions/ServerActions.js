import axios from "axios";

import {
  SERVER_CONNECTING,
  SERVER_CONNECT,
  SERVER_CONNECT_FAIL,
  SERVER_INIT,
  SERVER_DISCONNECT,
  SERVER_SYNC,
  SERVER_SYNCED,
  SERVER_UNDER_MAINTENANCE,
  SERVER_ERROR,
  USER_LOGOUT,
  SNACKBAR
} from "../constants";

import AccountsActions from "./AccountsActions";
import TransactionsActions from "./TransactionActions";
import CategoriesActions from "./CategoryActions";
import CurrenciesActions from "./CurrenciesActions";
import ChangesActions from "./ChangeActions";
import UserActions from "./UserActions";

let timer;
const ServerActions = {
  connect: url => {
    return (dispatch, getState) => {
      // Default default url in axios
      axios.defaults.baseURL = url;

      dispatch({
        type: SERVER_CONNECTING
      });

      return axios({
        url: "/api/init",
        method: "get"
      })
        .then(response => {
          const server = response.data;
          server.url = url;
          server.name = url
            .replace("http://", "")
            .replace("https://", "")
            .split(/[/?#]/)[0];

          if (server.name === "seven23.io") {
            server.isOfficial = true;
          } else {
            server.isOfficial = false;
          }
          dispatch({
            type: SERVER_CONNECT,
            server
          });
          return Promise.resolve(server);
        })
        .catch(function(ex) {
          dispatch({
            type: SERVER_CONNECT_FAIL
          });
          throw new Error(ex);
        });
    };
  },

  init: () => {
    return (dispatch, getState) => {
      return axios({
        url: "/api/init",
        method: "get"
      })
        .then(response => {
          const server = response.data;
          dispatch({
            type: SERVER_INIT,
            server
          });
          return Promise.resolve(server);
        })
        .catch(function(ex) {
          throw new Error(ex);
        });
    };
  },

  sync: () => {
    return (dispatch, getState) => {
      if (!getState().server.isLogged) {
        return Promise.all([
          dispatch(CategoriesActions.refresh()),
          dispatch(ChangesActions.refresh()),
          dispatch(TransactionsActions.refresh())
        ]);
      } else if (!getState().state.isSyncing) {
        dispatch({
          type: SERVER_SYNC
        });
        return Promise.all([
          dispatch(ServerActions.init()),
          dispatch(UserActions.fetchProfile()),
          dispatch(CurrenciesActions.sync()),
          dispatch(CategoriesActions.sync())
        ])
          .then(() => {
            return dispatch(ChangesActions.sync());
          })
          .then(() => {
            return dispatch(TransactionsActions.sync());
          })
          .then(_ => {
            dispatch({
              type: SERVER_SYNCED
            });
          })
          .catch(exception => {
            console.error(exception);
            if (getState().state.isLogging) {
              dispatch({
                type: USER_LOGOUT
              });
            } else {
              dispatch({
                type: SERVER_ERROR
              });
              dispatch({
                type: SNACKBAR,
                snackbar: {
                  message: "Server sync just failed. Please try again later."
                }
              });
            }
          });
      }
    };
  },

  disconnect: () => {
    return {
      type: SERVER_DISCONNECT
    };
  },

  maintenance: () => {
    return (dispatch, getState) => {
      if (!timer) {
        timer = setTimeout(() => {
          clearTimeout(timer);
        }, 4000);
        dispatch({
          type: SERVER_UNDER_MAINTENANCE
        });
        dispatch({
          type: SNACKBAR,
          snackbar: {
            message:
              "Sorry, server is currently under maintenance. Please try again later."
          }
        });
      }
      return Promise.resolve();
    };
  },

  error: exception => {
    return (dispatch, getState) => {
      if (!timer) {
        timer = setTimeout(() => {
          clearTimeout(timer);
        }, 4000);

        dispatch({
          type: SERVER_ERROR,
          status: exception ? exception.status : "",
          message: exception ? exception.statusText : ""
        });

        if (
          getState().user &&
          getState().user.profile &&
          new Date(getState().user.profile.valid_until) < new Date()
        ) {
          dispatch({
            type: SNACKBAR,
            snackbar: {
              message: "Sync failed because of expired subscription"
            }
          });
        } else if (!exception) {
          dispatch({
            type: SNACKBAR,
            snackbar: {
              message: "Server is not responding, please try again later."
            }
          });
        } else {
          dispatch({
            type: SNACKBAR,
            snackbar: {
              message: "An unexpected error occured, please try again later."
            }
          });
        }
      }
      return Promise.resolve();
    };
  }
};

export default ServerActions;
