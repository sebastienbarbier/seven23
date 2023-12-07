import {
  NAVIGATE,
  SNACKBAR,
  MODAL,
  APP_LAST_SEEN,
  SNACKBAR_POP,
  CACHE_DID_UPDATE,
  NAV_BAR,
  HIDE_NAV_BAR,
  RESET,
  VISIBILITY,
  DASHBOARD_UPDATE_CONFIG,
  TOGGLE_DEVELOPER,
  FLOATING_ADD_BUTTON,
} from "../constants";

import TransactionActions from "./TransactionActions";
import ChangeActions from "./ChangeActions";
import CategoryActions from "./CategoryActions";
import ServerActions from "./ServerActions";
import Storage from "../storage";

import { Workbox } from "workbox-window";

var AppActions = {
  /* Navigate event save current url to reopen the app as if the user never left
  (was really usefull on smartphone before iOS kept webapp states on leave event).  */
  navigate: (url) => {
    return {
      type: NAVIGATE,
      url,
    };
  },
  lastSeen: () => {
    return {
      type: APP_LAST_SEEN,
    };
  },
  cacheDidUpdate: (callback) => {
    return (dispatch, getState) => {
      if (!getState().state.cacheDidUpdate) {
        dispatch({
          type: CACHE_DID_UPDATE,
        });
        dispatch(
          AppActions.snackbar(
            "🔥 An update has just been installed and is now available on your device.",
            "Restart to update",
            () => {
              callback();
            }
          )
        );
      }
    };
  },
  snackbar: (message, buttonLabel = null, onClick = null) => {
    return {
      type: SNACKBAR,
      snackbar: {
        message,
        buttonLabel,
        onClick,
      },
    };
  },
  hideNavigation: (isHidden = true) => {
    return (dispatch, getState) => {
      if (getState().state.navbarIsHidden != isHidden) {
        dispatch({
          type: HIDE_NAV_BAR,
          isHidden,
        });
      }
    };
  },
  setNavBar: (title = null, back = null, next = null, height = 0) => {
    return {
      type: NAV_BAR,
      title,
      back,
      next,
      height,
    };
  },
  setFloatingAddButton: (action, enabled = true) => {
    return {
      type: FLOATING_ADD_BUTTON,
      fab: {
        action: action,
        enabled: !!enabled,
      },
    };
  },
  closeFloatingAddButton: () => {
    return {
      type: FLOATING_ADD_BUTTON,
      fab: null,
    };
  },
  openModal: (component) => {
    return {
      type: MODAL,
      modal: component,
    };
  },
  closeModal: () => {
    return {
      type: MODAL,
      modal: null,
    };
  },
  removeReadSnackbar: (message) => {
    return {
      type: SNACKBAR_POP,
    };
  },
  reload: (_) => {
    document.getElementById("splashscreen").children[0].classList.remove("show");
    document.getElementById("splashscreen").classList.remove("hide");

    function reload () {
      setTimeout(() => {
        window.location.reload();
      }, 250);
    };

    if ('serviceWorker' in navigator) {
      // Unregister all workers to force refresh
      navigator.serviceWorker.getRegistrations().then(function (registrations) {
        //returns installed service workers
        if (registrations.length) {
          for(let registration of registrations) {
            if (!!registration.waiting) {
              registration.waiting.postMessage({type: 'SKIP_WAITING'});
            }
          }
          reload();
        } else {
          reload();
        }
      });
    } else {
      reload();
    }
  },
  reset: (_) => {
    return (dispatch, getState) => {
      TransactionActions.flush();
      ChangeActions.flush();
      CategoryActions.flush();

      dispatch({
        type: RESET,
      });

      return Promise.resolve();
    };
  },
  setConfidential: (isConfidential) => {
    return {
      type: VISIBILITY,
      isConfidential,
    };
  },
  toggleDeveloperMode: () => {
    return {
      type: TOGGLE_DEVELOPER,
    };
  },
  setUpdateMessage: (value) => {
    return {
      type: CACHE_DID_UPDATE,
      value: value,
    };
  },
};

export default AppActions;