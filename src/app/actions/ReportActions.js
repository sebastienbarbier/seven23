import { REPORT_SET_DATES } from "../constants";

var ReportActions = {
  setDates: (dateBegin, dateEnd, title) => {
    return {
      type: REPORT_SET_DATES,
      dateBegin,
      dateEnd,
      title,
    };
  },
};

export default ReportActions;
