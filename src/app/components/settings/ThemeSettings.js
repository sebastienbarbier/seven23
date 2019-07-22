import React from "react";
import { useSelector, useDispatch } from "react-redux";

import Switch from "@material-ui/core/Switch";
import List from "@material-ui/core/List";
import ListSubheader from "@material-ui/core/ListSubheader";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";

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
    <List className="wrapperMobile">
      <ListSubheader disableSticky={true}>Theme</ListSubheader>
      <ListItem>
        <ListItemText primary="Dark mode" />
        <ListItemSecondaryAction>
          <Switch onChange={_switchTheme} checked={theme === "dark"} />
        </ListItemSecondaryAction>
      </ListItem>
      <ListSubheader disableSticky={true}>Confidentiality</ListSubheader>
      <ListItem>
        <ListItemText
          primary="Hide amounts"
          secondary="Blur numbers to show the app without informations"
        />
        <ListItemSecondaryAction>
          <Switch onChange={_switchVisibility} checked={isConfidential} />
        </ListItemSecondaryAction>
      </ListItem>
    </List>
  );
}
