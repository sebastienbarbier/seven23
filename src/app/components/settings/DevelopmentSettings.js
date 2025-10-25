import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import ListItemText from "@mui/material/ListItemText";
import Switch from "@mui/material/Switch";

import BugReportIcon from "@mui/icons-material/BugReport";
import CachedIcon from "@mui/icons-material/Cached";
import ReportIcon from "@mui/icons-material/Report";
import Divider from "@mui/material/Divider";

import AppActions from "../../actions/AppActions";
import UserActions from "../../actions/UserActions";

export default function DevelopmentSettings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isLogged = useSelector((state) => state.server.isLogged);
  const update_available = useSelector((state) => state.state.cacheDidUpdate);
  const isBackedUpKey = useSelector(
    (state) => state?.user?.profile?.profile?.key_verified == true
  );

  const testSnackbar = () => {
    dispatch(AppActions.snackbar("TEST"));
  };

  const setBackupKeyToFalse = () => {
    dispatch(UserActions.setBackupKey(false));
  };

  const setUpdateMessage = () => {
    dispatch(AppActions.setUpdateMessage(!update_available));
  };

  const checkForUpdates = () => {
    navigator.serviceWorker.register("/service-worker.js").then((reg) => {
      reg.update();
    });
  };

  return (
    <div className="layout_content wrapperMobile">
      <List>
        <ListItem>
          <ListItemText
            primary="Build date"
            secondary={
              process.env.BUILD_DATE
                ? moment(process.env.BUILD_DATE).toString()
                : "NC"
            }
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Commit number"
            secondary={
              process.env.GIT_COMMIT
                ? JSON.stringify(`${process.env.GIT_COMMIT}`)
                : "NC"
            }
          />
        </ListItem>

        <ListItem button onClick={() => checkForUpdates()}>
          <ListItemIcon>
            <CachedIcon />
          </ListItemIcon>
          <ListItemText primary="Check for update" />
        </ListItem>
        <Divider />
        <ListItem button onClick={() => window.method.does.not.exist()}>
          <ListItemIcon>
            <BugReportIcon />
          </ListItemIcon>
          <ListItemText
            primary="Generate fake exception"
            secondary="Useful to test error handling and reporting"
          />
        </ListItem>
        <ListItem button onClick={() => navigate("/crash")}>
          <ListItemIcon>
            <ReportIcon />
          </ListItemIcon>
          <ListItemText
            primary="Show report bug screen"
            secondary="Display the Bug report"
          />
        </ListItem>
        <Divider />
        <ListItem button onClick={() => testSnackbar()}>
          <ListItemText primary="Show snackbar" secondary="Open a snackbar" />
        </ListItem>
        <ListItem
          button
          disabled={!isLogged}
          onClick={() => setBackupKeyToFalse()}
        >
          <ListItemText
            primary="Set backed up key to false"
            secondary={`Current value is ${
              isLogged ? isBackedUpKey : "not logged in"
            }`}
          />
        </ListItem>
        <ListItem
          button
          disabled={!isLogged}
          onClick={() => setUpdateMessage()}
        >
          <ListItemText
            primary="Toggle update message"
            secondary={"Allow to test UI on dashboard with alert message"}
          />
          <ListItemSecondaryAction>
            <Switch
              onChange={() => setUpdateMessage()}
              checked={update_available}
            />
          </ListItemSecondaryAction>
        </ListItem>
      </List>
    </div>
  );
}
