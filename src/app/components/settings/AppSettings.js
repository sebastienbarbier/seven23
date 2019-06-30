import React from "react";
import moment from "moment";

import List from "@material-ui/core/List";
import ListSubheader from "@material-ui/core/ListSubheader";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";

import Divider from "@material-ui/core/Divider";
import RefreshIcon from "@material-ui/icons/Refresh";

export default function AppSettings() {
  return (
    <div
      className="layout_content wrapperMobile"
      subheader={
        <ListSubheader disableSticky={true}>Authentication</ListSubheader>
      }
    >
      <List>
        <ListItem>
          <ListItemText
            primary="Build date"
            secondary={process.env.BUILD_DATE || "NC"}
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Commit number"
            secondary={process.env.TRAVIS_COMMIT || "NC"}
          />
        </ListItem>
        <Divider />
        <ListItem button onClick={() => window.location.reload()}>
          <ListItemIcon>
            <RefreshIcon />
          </ListItemIcon>
          <ListItemText
            primary="Force refresh"
            secondary="Reload current page"
          />
        </ListItem>
      </List>
    </div>
  );
}
