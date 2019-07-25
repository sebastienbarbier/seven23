/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import md5 from "blueimp-md5";
import { Link } from "react-router-dom";

import Button from "@material-ui/core/Button";

import MenuItem from "@material-ui/core/MenuItem";
import List from "@material-ui/core/List";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItem from "@material-ui/core/ListItem";

import Avatar from "@material-ui/core/Avatar";
import ExpandMore from "@material-ui/icons/ExpandMore";
import Person from "@material-ui/icons/Person";

import Popover from "@material-ui/core/Popover";

import Divider from "@material-ui/core/Divider";

import SettingsIcon from "@material-ui/icons/Settings";
import PowerSettingsNewIcon from "@material-ui/icons/PowerSettingsNew";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";

import SyncButton from "../accounts/SyncButton";
import AccountSelector from "../accounts/AccountSelector";
import CurrencySelector from "../currency/CurrencySelector";

import AppActions from "../../actions/AppActions";

export default function UserButton({ type, color }) {
  const dispatch = useDispatch();
  const profile = useSelector(state => state.user.profile);
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

  const handleClick = (event = {}) => {
    setAnchorEl(event.currentTarget);
    setOpen(!open);
  };

  const isHideMode = useSelector(state => state.app.isConfidential);
  const toggleHideMode = () => {
    dispatch(AppActions.setConfidential(!isHideMode));
    setOpen(!open);
  };

  return (
    <div className="wrapperMobile">
      {!profile && (
        <Button style={{ padding: "6px 16px" }} onClick={handleClick}>
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
      )}

      {profile && type === "button" ? (
        <Button onClick={handleClick}>
          <div
            className={`${badge || isSyncing ? "open" : ""}
              ${isSyncing ? "isSyncing" : ""}
              badgeSync`}
          >
            {profile &&
            profile.profile &&
            profile.profile.avatar == "GRAVATAR" ? (
              <Avatar
                src={gravatar}
                style={{
                  height: 30,
                  width: 30,
                  marginTop: 1,
                  background: "rgba(0, 0, 0, 0.3)"
                }}
              />
            ) : (
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
            )}
          </div>
          <span className="hideMobile">
            {profile ? profile.first_name || profile.username : ""}
          </span>
          <ExpandMore color="action" style={{ color: color }} />
        </Button>
      ) : profile ? (
        <MenuItem
          style={{ height: "50px", paddingTop: 0, paddingBottom: 0 }}
          onClick={handleClick}
        >
          {profile && profile.profile && profile.profile.avatar == "GRAVATAR" && (
            <ListItemAvatar>
              <Avatar
                src={gravatar}
                style={{
                  height: 30,
                  width: 30,
                  marginTop: 1,
                  background: "rgba(0, 0, 0, 0.3)"
                }}
              />
            </ListItemAvatar>
          )}
          {profile && profile.profile && profile.profile.avatar != "GRAVATAR" && (
            <ListItemAvatar>
              <Avatar
                style={{
                  height: 30,
                  width: 30,
                  fontSize: 14,
                  marginTop: 1,
                  background: "rgba(0, 0, 0, 0.5)",
                  textTransform: "uppercase",
                  color: "white"
                }}
              >
                {first_letter}
              </Avatar>
            </ListItemAvatar>
          )}
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

          {profile ? (
            <ListItemText className="hideMobile">
              {profile.first_name || profile.username}
            </ListItemText>
          ) : (
            ""
          )}
          <ListItemIcon>
            <ExpandMore color="action" style={{ color: color }} />
          </ListItemIcon>
        </MenuItem>
      ) : (
        ""
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
        {account && !account.isLocal ? (
          <SyncButton
            onClick={event => handleClick(event)}
            className="hideDesktop"
          />
        ) : (
          ""
        )}
        {account && !account.isLocal ? <Divider className="hideDesktop" /> : ""}
        {accounts && accounts.length > 1 ? (
          <AccountSelector
            disabled={isSyncing}
            onChange={event => handleClick(event)}
            className="hideDesktop"
          />
        ) : (
          ""
        )}
        {accounts && accounts.length >= 1 ? (
          <CurrencySelector
            disabled={isSyncing}
            onChange={event => handleClick(event)}
            display="code"
            className="hideDesktop"
          />
        ) : (
          ""
        )}
        <List style={{ padding: 0, margin: 0 }}>
          {accounts && accounts.length >= 1 ? (
            <Divider className="hideDesktop" />
          ) : (
            ""
          )}

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

          {accounts && accounts.length >= 1 ? (
            <Link to="/settings" onClick={event => handleClick(event)}>
              <ListItem button>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Settings" />
              </ListItem>
            </Link>
          ) : (
            ""
          )}
          {accounts && accounts.length >= 1 ? <Divider /> : ""}
          {server.isLogged ? (
            <Link to="/logout" onClick={event => handleClick(event)}>
              <ListItem button>
                <ListItemIcon>
                  <PowerSettingsNewIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItem>
            </Link>
          ) : (
            <ListItem
              button
              onClick={event => {
                dispatch(AppActions.popup("login"));
                handleClick();
              }}
            >
              <ListItemIcon>
                <PowerSettingsNewIcon />
              </ListItemIcon>
              <ListItemText primary="Login" />
            </ListItem>
          )}
        </List>
      </Popover>
    </div>
  );
}
