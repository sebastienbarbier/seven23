import { useDispatch, useSelector } from "react-redux";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import Switch from "@mui/material/Switch";

import AppActions from "../../actions/AppActions";
import UserActions from "../../actions/UserActions";

export default function ThemeSettings() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.app.theme);
  const isConfidential = useSelector((state) => state.app.isConfidential);

  const _switchTheme = () => {
    dispatch(UserActions.setTheme(theme === "dark" ? "light" : "dark"));
  };

  const _switchVisibility = () => {
    dispatch(AppActions.setConfidential(!isConfidential));
  };

  return (
    <div className="layout_content wrapperMobile">
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
