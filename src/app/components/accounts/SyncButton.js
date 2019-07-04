/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import "./SyncButton.scss";
import moment from "moment";

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { makeStyles } from "@material-ui/styles";

import MenuItem from "@material-ui/core/MenuItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";

import LoopIcon from "@material-ui/icons/Loop";
import Tooltip from "@material-ui/core/Tooltip";
import Badge from "@material-ui/core/Badge";

import ServerActions from "../../actions/ServerActions";

const useStyles = makeStyles({
  badge: {
    top: "50%",
    right: -3
  },
  badge2digits: {
    top: "50%",
    right: -5
  },
  badge3digits: {
    top: "50%",
    right: -8
  }
});

export default function SyncButton(props) {
  const dispatch = useDispatch();
  const isSyncing = useSelector(
    state => state.state.isSyncing || state.state.isLoading
  );
  const last_sync = useSelector(state => state.server.last_sync);
  const badge = useSelector(state => state.sync.counter || 0);

  const classes = useStyles();

  let badgeStyle = classes.badge;
  if (badge > 9 && badge <= 99) {
    badgeStyle = classes.badge2digits;
  } else if (badge > 99) {
    badgeStyle = classes.badge3digits;
  }

  const sync = () => {
    if (props.onClick) {
      props.onClick();
    }
    dispatch(ServerActions.sync());
  };

  return (
    <div className={props.className}>
      <Tooltip
        title={`Last sync ${moment(last_sync).fromNow()}`}
        enterDelay={450}
        placement="bottom"
      >
        <MenuItem
          disabled={isSyncing}
          onClick={() => {
            sync();
          }}
        >
          <ListItemIcon>
            <Badge
              badgeContent={badge > 99 ? "99+" : badge}
              invisible={isSyncing || !badge}
              classes={{ badge: badgeStyle }}
              color="primary"
            >
              <LoopIcon
                className={
                  isSyncing ? "syncingAnimation" : "syncingAnimation stop"
                }
              />
            </Badge>
          </ListItemIcon>
          <ListItemText>Sync</ListItemText>
        </MenuItem>
      </Tooltip>
    </div>
  );
}
