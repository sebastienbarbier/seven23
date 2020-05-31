import {
  NAVIGATE,
  SNACKBAR,
  APP_LAST_SEEN,
  SNACKBAR_POP,
  CACHE_DID_UPDATE,
  RESET,
  POPUP,
  VISIBILITY,
} from "../constants";

import TransactionActions from "./TransactionActions";
import ChangeActions from "./ChangeActions";
import CategoryActions from "./CategoryActions";
import Storage from "../storage";

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
  removeReadSnackbar: (message) => {
    return {
      type: SNACKBAR_POP,
    };
  },
  reload: (_) => {
    document.getElementById("splashscreen").classList.remove("hide");
    setTimeout(() => {
      window.location.reload();
    }, 250);
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
  popup: (content) => {
    return {
      type: POPUP,
      popup: content,
    };
  },
  setConfidential: (isConfidential) => {
    return {
      type: VISIBILITY,
      isConfidential,
    };
  },
};

export default AppActions;
