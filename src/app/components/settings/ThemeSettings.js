import React from "react";
import { useSelector, useDispatch } from "react-redux";

import Switch from "@mui/material/Switch";
import List from "@mui/material/List";
import ListSubheader from "@mui/material/ListSubheader";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";

import UserActions from "../../actions/UserActions";
import AppActions from "../../actions/AppActions";

const styles = theme => ({});

export default function ThemeSettings() {
  const dispatch = useDispatch();
  const theme = useSelector(state => state.app.theme);
  const isConfidential = useSelector(state => state.app.isConfidential);

  const _switchTheme = () => {
    dispatch(UserActions.setTheme(theme === "dark" ? "light" : "dark"));
  };

  const _switchVisibility = () => {
    dispatch(AppActions.setConfidential(!isConfidential));
  };

  return (
    <div className="layout_content wrapperMobile mobile_footer_padding">
      <List className="wrapperMobile">
        <ListSubheader disableSticky={true}>Theme</ListSubheader>
        <ListItem button onClick={() => _switchTheme()}>
          <ListItemText primary="Dark mode" />
          <ListItemSecondaryAction>
            <Switch onChange={_switchTheme} checked={theme === "dark"} />
          </ListItemSecondaryAction>
        </ListItem>
        <ListSubheader disableSticky={true}>Confidentiality</ListSubheader>
        <ListItem button onClick={() => _switchVisibility()}>
          <ListItemText
            primary="Hide amounts"
            secondary="Blur numbers to show the app without informations"
          />
          <ListItemSecondaryAction>
            <Switch onChange={_switchVisibility} checked={isConfidential} />
          </ListItemSecondaryAction>
        </ListItem>
      </List>
    </div>
  );
}