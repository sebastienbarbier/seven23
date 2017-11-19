import {
  USER_LOGIN,
  USER_LOGOUT,
  CHANGE_EVENT,
  USER_UPDATE_REQUEST,
  USER_DELETE_REQUEST,
  USER_CHANGE_PASSWORD,
  USER_CHANGE_EMAIL,
  USER_REVOKE_TOKEN,
} from "../constants";

import dispatcher from "../dispatcher/AppDispatcher";
import AccountStore from "./AccountStore";
import CategoryStore from "./CategoryStore";
import ChangeStore from "./ChangeStore";
import CurrencyStore from "./CurrencyStore";
import TransactionStore from "./TransactionStore";
import ServerStore from "./ServerStore";

import axios from "axios";
import auth from "../auth";

import { EventEmitter } from "events";

let user = null;

class UserStore extends EventEmitter {
  constructor() {
    super();
  }

  emitChangePassword(args) {
    this.emit(USER_CHANGE_PASSWORD, args);
  }

  emitChange(args) {
    this.emit(CHANGE_EVENT, args);
  }

  addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback);
  }

  removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }

  onceChangeListener(callback) {
    this.once(CHANGE_EVENT, callback);
  }

  onceChangePasswordListener(callback) {
    this.once(USER_CHANGE_PASSWORD, callback);
  }

  get user() {
    return user;
  }

  initialize() {
    return axios({
      url: "/api/v1/rest-auth/user/",
      method: "get",
      headers: {
        Authorization: "Token " + localStorage.getItem("token"),
      },
    })
      .then(response => {
        user = response.data;
      })
      .catch(function(ex) {
        throw new Error(ex);
      });
  }

  reset() {
    user = null;
    return Promise.resolve();
  }

  getUserId() {
    return user ? user.id : null;
  }

  loggedIn() {
    return localStorage.getItem("token") !== null;
  }
}

let UserStoreInstance = new UserStore();

UserStoreInstance.dispatchToken = dispatcher.register(action => {
  switch (action.type) {
    case USER_REVOKE_TOKEN:
      axios({
        url: "/api/v1/users/token",
        method: "DELETE",
        headers: {
          Authorization: "Token " + localStorage.getItem("token"),
        },
      })
        .then(response => {
          UserStoreInstance.emitChange();
        })
        .catch(exception => {
          UserStoreInstance.emitChange(
            exception.response ? exception.response.data : null
          );
        });
      break;
    case USER_LOGIN:
      axios({
        url: "/api/api-token-auth/",
        method: "POST",
        data: {
          username: action.username,
          password: action.password,
        },
      })
        .then(json => {
          localStorage.setItem("token", json.data.token);
          return auth.initialize();
        })
        .then(() => {
          UserStoreInstance.emitChange();
        })
        .catch(exception => {
          console.error(exception);
          localStorage.removeItem("token");
          UserStoreInstance.emitChange(
            exception.response ? exception.response.data : null
          );
        });
      break;
    case USER_LOGOUT:
      axios
        .all([
          AccountStore.reset(),
          CategoryStore.reset(),
          CurrencyStore.reset(),
          ChangeStore.reset(),
          TransactionStore.reset(),
          ServerStore.reset(),
          UserStoreInstance.reset(),
          auth.reset(),
        ])
        .then(() => {
          localStorage.removeItem("token");
          UserStoreInstance.emitChange();
        })
        .catch(err => {
          console.error(err);
        });
      break;
    case USER_CHANGE_PASSWORD:
      axios({
        url: "/api/v1/rest-auth/password/change/",
        method: "POST",
        headers: {
          Authorization: "Token " + localStorage.getItem("token"),
        },
        data: action.data,
      })
        .then(json => {
          UserStoreInstance.emitChangePassword(action.user);
        })
        .catch(exception => {
          UserStoreInstance.emitChangePassword(
            exception.response ? exception.response.data : null
          );
        });
      break;
    case USER_CHANGE_EMAIL:
      axios({
        url: "/api/v1/users/email",
        method: "POST",
        headers: {
          Authorization: "Token " + localStorage.getItem("token"),
        },
        data: {
          email: action.data.email,
        },
      })
        .then(json => {
          UserStoreInstance.emitChange(json.data);
        })
        .catch(exception => {
          UserStoreInstance.emitChange(
            exception.response ? exception.response.data : null
          );
        });
      break;
    case USER_UPDATE_REQUEST:
      axios({
        url: "/api/v1/rest-auth/user/",
        method: "PATCH",
        headers: {
          Authorization: "Token " + localStorage.getItem("token"),
        },
        data: action.user,
      })
        .then(json => {
          UserStoreInstance.emitChange(json.data);
        })
        .catch(exception => {
          console.error(exception);
          UserStoreInstance.emitChange(
            exception.response ? exception.response.data : null
          );
        });
      break;
    case USER_DELETE_REQUEST:
      axios({
        url: "/api/v1/users/" + action.user.id,
        method: "DELETE",
        headers: {
          Authorization: "Token " + localStorage.getItem("token"),
        },
        data: action.user,
      })
        .then(json => {
          UserActions.logout();
        })
        .catch(exception => {
          console.error(exception);
          UserStoreInstance.emitChange(
            exception.response ? exception.response.data : null
          );
        });
      break;
    default:
      return;
  }
});

export default UserStoreInstance;
