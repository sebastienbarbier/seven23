import React, { useEffect, useState } from "react";
import moment from "moment";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from 'react-router-dom';

import List from "@mui/material/List";
import ListSubheader from "@mui/material/ListSubheader";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";

import Switch from "@mui/material/Switch";
import Divider from "@mui/material/Divider";
import RefreshIcon from "@mui/icons-material/Refresh";
import ExitToApp from "@mui/icons-material/ExitToApp";
import DeleteForever from "@mui/icons-material/DeleteForever";
import BugReportIcon from "@mui/icons-material/BugReport";
import ReportIcon from '@mui/icons-material/Report';

import UserActions from "../../actions/UserActions";
import AppActions from "../../actions/AppActions";
import DeveloperModeIcon from '@mui/icons-material/DeveloperMode';

import package_json from "../../../../package.json";

export default function DevelopmentSettings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isLogged = useSelector(state => state.server.isLogged);
  const isBackedUpKey = useSelector((state) =>
    state?.user?.profile?.profile?.key_verified == true
  );

  const testSnackbar = () => {
    dispatch(AppActions.snackbar('TEST'));
  };

  const setBackupKeyToFalse = () => {
    dispatch(UserActions.setBackupKey(false));
  };

  return (
    <div
      className="layout_content wrapperMobile mobile_footer_padding"
      subheader={
        <ListSubheader disableSticky={true}>Authentication</ListSubheader>
      }
    >
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
            secondary={process.env.GIT_COMMIT ? JSON.stringify(`${process.env.GIT_COMMIT}`) : "NC"}
          />
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
        <ListItem button onClick={() => navigate('/crash')}>
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
          <ListItemText
            primary="Show snackbar"
            secondary="Open a snackbar"
          />
        </ListItem>
        <ListItem button disabled={!isLogged} onClick={() => setBackupKeyToFalse()}>
          <ListItemText
            primary="Set backed up key to false"
            secondary={`Current value is ${isLogged ? isBackedUpKey : 'not logged in'}`}
          />
        </ListItem>
      </List>
    </div>
  );
}