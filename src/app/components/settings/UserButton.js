/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import md5 from "blueimp-md5";
import { Link } from "react-router-dom";

import Button from "@mui/material/Button";

import MenuItem from "@mui/material/MenuItem";
import List from "@mui/material/List";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItem from "@mui/material/ListItem";

import Avatar from "@mui/material/Avatar";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Person from "@mui/icons-material/Person";

import Popover from "@mui/material/Popover";

import Divider from "@mui/material/Divider";

import SettingsIcon from "@mui/icons-material/Settings";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import SyncButton from "../accounts/SyncButton";
import AccountSelector from "../accounts/AccountSelector";
import CurrencySelector from "../currency/CurrencySelector";

import AppActions from "../../actions/AppActions";

export default function UserButton({ type, color, onModal }) {
  const dispatch = useDispatch();
  const profile = useSelector(state => state.user.profile);
  const networks = useSelector(state => state.user.socialNetworks);
  const isSyncing = useSelector(state => state.state.isSyncing);
  const accounts = useSelector(state => [
    ...state.accounts.remote,
    ...state.accounts.local
  ]);
  const badge = useSelector(state => state.sync.counter || 0);

  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const [first_letter, setFirstLetter] = useState(null);
  const [gravatar, setGravatar] = useState();
  const [nomadlist, setNomadlist] = useState(
    networks && networks.nomadlist && networks.nomadlist.data
      ? networks.nomadlist.data.photo || null
      : null
  );

  const account = useSelector(state => state.account);
  const server = useSelector(state => state.server);

  useEffect(() => {
    if (profile) {
      const first_letter = profile.first_name
        ? profile.first_name[0]
        : profile.username[0];
      setFirstLetter(first_letter);

      setGravatar(`https://www.gravatar.com/avatar/${md5(profile.email)}?d=mp`);
    }
  }, [profile]);

  useEffect(() => {
    setNomadlist(
      networks && networks.nomadlist && networks.nomadlist.data
        ? networks.nomadlist.data.photo || null
        : null
    );
  }, [networks]);

  const handleClick = (event = {}) => {
    setAnchorEl(event ? event.currentTarget : anchorEl);
    setOpen(!open);
  };

  const isHideMode = useSelector(state => state.app.isConfidential);
  const toggleHideMode = () => {
    dispatch(AppActions.setConfidential(!isHideMode));
    setOpen(!open);
  };

  let avatar_component = (
    <Avatar
      style={{
        height: 30,
        width: 30,
        fontSize: 14,
        marginTop: 1,
        background: "rgba(0, 0, 0, 0.3)",
        textTransform: "uppercase",
        color: "white"
      }}
    >
      {first_letter}
    </Avatar>
  );

  if (profile && profile.profile) {
    if (profile.profile.avatar == "GRAVATAR") {
      avatar_component = (
        <Avatar
          src={gravatar}
          style={{
            height: 30,
            width: 30,
            marginTop: 1,
            background: "rgba(0, 0, 0, 0.3)"
          }}
        />
      );
    }

    if (profile.profile.avatar == "NOMADLIST" && nomadlist) {
      avatar_component = (
        <Avatar
          src={nomadlist}
          style={{
            height: 30,
            width: 30,
            marginTop: 1,
            background: "rgba(0, 0, 0, 0.3)"
          }}
        />
      );
    }
  }

  return (
    <div className="wrapperMobile">
      {!profile && 
        <Button style={{ padding: "8px 16px" }} onClick={handleClick} color="inherit">
          <div
            className={`${badge || isSyncing ? "open" : ""}
              ${isSyncing ? "isSyncing" : ""}
              badgeSync`}
          >
            <Avatar
              style={{
                height: 30,
                width: 30,
                fontSize: 14,
                marginTop: 1,
                background: "rgba(0, 0, 0, 0.3)",
                textTransform: "uppercase",
                color: "white"
              }}
            >
              <Person />
            </Avatar>
          </div>
          <ExpandMore color="action" style={{ color: color }} />
        </Button>
      }

      {profile && type === "button" ? (
        <Button onClick={handleClick}>
          <div
            className={`${badge || isSyncing ? "open" : ""}
              ${isSyncing ? "isSyncing" : ""}
              badgeSync`}
          >
            {avatar_component}
          </div>
          <span className="hideMobile">
            {profile ? profile.first_name || profile.username : ""}
          </span>
          <ExpandMore color="action" style={{ color: color }} />
        </Button>
      ) : profile && (
        <MenuItem
          style={{ height: "50px", paddingTop: 0, paddingBottom: 0 }}
          onClick={handleClick}
        >
          <ListItemAvatar>{avatar_component}</ListItemAvatar>
          {!profile && (
            <ListItemAvatar>
              <Avatar
                style={{
                  height: 30,
                  width: 30,
                  marginTop: 1,
                  background: "rgba(0, 0, 0, 0.3)"
                }}
              >
                <Person />
              </Avatar>
            </ListItemAvatar>
          )}

          {profile && 
            <ListItemText className="hideMobile">
              {profile.first_name || profile.username}
            </ListItemText>
          }
          <ListItemIcon>
            <ExpandMore color="action" style={{ color: color }} />
          </ListItemIcon>
        </MenuItem>
      )}
      <Popover
        id={open ? "user-popper" : null}
        open={open}
        onClose={handleClick}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right"
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right"
        }}
      >
        {account && !account.isLocal && 
          <>
            <SyncButton
              onClick={event => handleClick(event)}
              className="hideDesktop"
            />
            <Divider className="hideDesktop" />
          </>
        }
        {accounts && accounts.length > 1 && 
          <AccountSelector
            disabled={isSyncing}
            onChange={event => handleClick(event)}
            className="hideDesktop"
          />
        }
        {accounts && accounts.length >= 1 && (
          <CurrencySelector
            disabled={isSyncing}
            onChange={event => handleClick(event)}
            onClose={handleClick}
            display="code"
            className="hideDesktop"
            onModal={(component) => {
              console.log('onModal', onModal, component);
              if (onModal) {
                onModal(component);
              }
              setOpen(false);
            }}
          />
        )}
        <List style={{ padding: 0, margin: 0 }}>

          {accounts && accounts.length >= 1 && 
          <>
            <Divider className="hideDesktop" />
            <Link to="/settings" onClick={event => handleClick(event)}>
              <ListItem button>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Settings" />
              </ListItem>
            </Link>
          </>
          }

          {isHideMode ? (
            <ListItem button onClick={_ => toggleHideMode()}>
              <ListItemIcon>
                <Visibility />
              </ListItemIcon>
              <ListItemText primary="Show" />
            </ListItem>
          ) : (
            <ListItem button onClick={_ => toggleHideMode()}>
              <ListItemIcon>
                <VisibilityOff />
              </ListItemIcon>
              <ListItemText primary="Hide" />
            </ListItem>
          )}
        </List>
      </Popover>
    </div>
  );
}
