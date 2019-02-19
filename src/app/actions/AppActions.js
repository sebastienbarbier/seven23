import {
  NAVIGATE,
} from '../constants';

var ReportActions = {

  navigate: (url) => {
    return {
      type: NAVIGATE,
      url,
    };
  },

};

export default ReportActions;