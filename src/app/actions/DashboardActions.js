import { DASHBOARD_UPDATE_CONFIG } from "../constants";

var DashboardActions = {
  setConfig: (range, hiddenLines) => {
    return {
      type: DASHBOARD_UPDATE_CONFIG,
      range,
      hiddenLines,
    };
  },
};

export default DashboardActions;
