import {
  REPORT_SET_DATES,
} from '../constants';

var ReportActions = {

  setDates: (dateBegin, dateEnd) => {
    return {
      type: REPORT_SET_DATES,
      dateBegin,
      dateEnd
    };
  },

};

export default ReportActions;