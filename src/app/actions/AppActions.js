import {
  NAVIGATE,
  SNACKBAR,
  APP_LAST_SEEN,
  SNACKBAR_POP,
  RESET
} from "../constants";

import TransactionActions from "./TransactionActions";
import ChangeActions from "./ChangeActions";
import CategoryActions from "./CategoryActions";

var ReportActions = {
  /* Navigate event save current url to reopen the app as if the user never left
  (was really usefull on smartphone before iOS kept webapp states on leave event).  */
  navigate: url => {
    return {
      type: NAVIGATE,
      url
    };
  },
  lastSeen: () => {
    return {
      type: APP_LAST_SEEN
    };
  },
  snackbar: (message, buttonLabel = null, onClick = null) => {
    return {
      type: SNACKBAR,
      snackbar: {
        message,
        buttonLabel,
        onClick
      }
    };
  },
  removeReadSnackbar: message => {
    return {
      type: SNACKBAR_POP
    };
  },
  reset: _ => {
    return (dispatch, getState) => {
      TransactionActions.flush();
      ChangeActions.flush();
      CategoryActions.flush();

      dispatch({
        type: RESET
      });

      return Promise.resolve();
    };
  }
};

export default ReportActions;
