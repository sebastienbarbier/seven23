/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import "./SyncButton.scss";
import moment from "moment";

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { styled } from '@mui/material/styles';

import MenuItem from "@mui/material/MenuItem";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

import LoopIcon from "@mui/icons-material/Loop";
import Tooltip from "@mui/material/Tooltip";
import Badge from "@mui/material/Badge";

import ServerActions from "../../actions/ServerActions";

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 8,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

export default function SyncButton(props) {
  const dispatch = useDispatch();
  const isSyncing = useSelector(
    state => state.state.isSyncing || state.state.isLoading
  );
  const account = useSelector(state => state.account);
  const last_sync = useSelector(state => state.server.last_sync);
  const badge = useSelector(state => state.sync.counter || 0);

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
        <ListItem
        className="cy_sync_button"
        button
          disabled={isSyncing || account.isLocal}
          onClick={() => {
            sync();
          }}
        >
          <ListItemIcon>
            <StyledBadge
              badgeContent={badge}
              max={99}
              invisible={isSyncing || !badge}
              color="primary">
              <LoopIcon
                className={
                  isSyncing && !account.isLocal
                    ? "syncingAnimation"
                    : "syncingAnimation stop"
                }
              />
              </StyledBadge>
          </ListItemIcon>
          <ListItemText>Sync</ListItemText>
        </ListItem>
      </Tooltip>
    </div>
  );
}