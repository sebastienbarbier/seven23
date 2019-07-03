import React from "react";
import { useSelector, useDispatch } from "react-redux";

import Switch from "@material-ui/core/Switch";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";

import UserActions from "../../actions/UserActions";

const styles = theme => ({});

export default function ThemeSettings() {
  const dispatch = useDispatch();
  const theme = useSelector(state => state.app.theme);

  const _switchTheme = () => {
    dispatch(UserActions.setTheme(theme === "dark" ? "light" : "dark"));
  };

  return (
    <List className="wrapperMobile">
      <ListItem>
        <ListItemText primary="Dark mode" />
        <ListItemSecondaryAction>
          <Switch onChange={_switchTheme} checked={theme === "dark"} />
        </ListItemSecondaryAction>
      </ListItem>
    </List>
  );
}
