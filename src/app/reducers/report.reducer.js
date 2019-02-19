import {
  USER_LOGOUT,
  REPORT_SET_DATES
} from '../constants';

const initialState = {
  dateBegin: new Date(),
  dateEnd: new Date(),
  title: null
};

function goals(state = initialState, action) {
  switch (action.type) {

  case REPORT_SET_DATES:
    return Object.assign({}, {
      dateBegin: action.dateBegin.toDate(),
      dateEnd: action.dateEnd.toDate(),
      title: action.title
    });
  case USER_LOGOUT:
    return Object.assign({}, initialState);
  default:
    return state;
  }
}

export default goals;