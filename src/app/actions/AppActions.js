import { NAVIGATE } from "../constants";

var ReportActions = {
  /* Navigate event save current url to reopen the app as if the user never left
  (was really usefull on smartphone before iOS kept webapp states on leave event).  */
  navigate: url => {
    return {
      type: NAVIGATE,
      url
    };
  }
};

export default ReportActions;
