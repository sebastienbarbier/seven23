import { REPORT_SET_DATES, RESET, USER_LOGOUT } from "../constants";

import moment from "moment";

const initialState = {
  dateBegin: moment.utc().startOf("year"),
  dateEnd: moment.utc().endOf("year"),
  title: null,
};

function report(state = initialState, action) {
  switch (action.type) {
    case REPORT_SET_DATES:
      return Object.assign(
        {},
        {
          dateBegin: action.dateBegin.toDate(),
          dateEnd: action.dateEnd.toDate(),
          title: action.title,
        }
      );
    case USER_LOGOUT:
      return Object.assign({}, initialState);
    case RESET:
      return Object.assign({}, initialState);
    default:
      return state;
  }
}

export default report;
