/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import md5 from "blueimp-md5";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import Button from "@mui/material/Button";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

import ExpandMore from "@mui/icons-material/ExpandMore";
import NavigateNext from "@mui/icons-material/NavigateNext";
import Person from "@mui/icons-material/Person";
import Avatar from "@mui/material/Avatar";

import Popover from "@mui/material/Popover";

import Divider from "@mui/material/Divider";

import SettingsIcon from "@mui/icons-material/Settings";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import AccountSelector from "../accounts/AccountSelector";
import SyncButton from "../accounts/SyncButton";
import CurrencySelector from "../currency/CurrencySelector";

import AppActions from "../../actions/AppActions";

import "./UserButton.scss";

export default function UserButton({ direction = "bottom" }) {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.user.profile);
  const networks = useSelector((state) => state.user.socialNetworks);
  const isSyncing = useSelector((state) => state.state.isSyncing);

  const nbAccount = useSelector(
    (state) => state.accounts.remote.length + state.accounts.local.length
  );

  const badge = useSelector((state) => state.sync.counter || 0);

  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const [first_letter, setFirstLetter] = useState(null);
  const [gravatar, setGravatar] = useState();
  const [nomadlist, setNomadlist] = useState(
    networks && networks.nomadlist && networks.nomadlist.data
      ? networks.nomadlist.data.photo || null
      : null
  );

  const account = useSelector((state) => state.account);
  const server = useSelector((state) => state.server);

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

  const isHideMode = useSelector((state) => state.app.isConfidential);
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
        color: "white",
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
            background: "rgba(0, 0, 0, 0.3)",
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
            background: "rgba(0, 0, 0, 0.3)",
          }}
        />
      );
    }
  }

  return (
    <div className="wrapperMobile">
      {!profile ? (
        <Button
          style={{ padding: "8px 16px" }}
          onClick={handleClick}
          color="inherit"
        >
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
                color: "white",
              }}
            >
              <Person />
            </Avatar>
          </div>
          {direction == "bottom" && <ExpandMore sx={{ color: "white" }} />}
          {direction == "left" && (
            <NavigateNext sx={{ color: "white", width: 20 }} />
          )}
        </Button>
      ) : (
        <Button onClick={handleClick}>
          <div
            className={`${badge || isSyncing ? "open" : ""}
              ${isSyncing ? "isSyncing" : ""}
              badgeSync`}
          >
            {avatar_component}
          </div>
          {direction == "bottom" && <ExpandMore sx={{ color: "white" }} />}
          {direction == "left" && (
            <NavigateNext sx={{ color: "white", width: 20 }} />
          )}
        </Button>
      )}
      <Popover
        id={open ? "user-popper" : null}
        open={open}
        onClose={handleClick}
        anchorEl={anchorEl}
        anchorOrigin={
          direction == "bottom"
            ? {
                vertical: "bottom",
                horizontal: "right",
              }
            : {
                vertical: "bottom",
                horizontal: "right",
              }
        }
        transformOrigin={
          direction == "bottom"
            ? {
                vertical: "top",
                horizontal: "right",
              }
            : {
                vertical: "bottom",
                horizontal: "left",
              }
        }
      >
        {direction == "left" && (
          <>
            <ListItem button onClick={(_) => toggleHideMode()}>
              <ListItemIcon>
                {isHideMode ? <Visibility /> : <VisibilityOff />}
              </ListItemIcon>
              <ListItemText primary={isHideMode ? "Show" : "Hide"} />
            </ListItem>
            <Divider />
          </>
        )}

        {account && !account.isLocal && direction == "bottom" && (
          <>
            <SyncButton onClick={(event) => handleClick(event)} />
            <Divider />
          </>
        )}
        {nbAccount > 1 && (
          <AccountSelector
            disabled={isSyncing}
            direction={direction}
            onChange={(event) => handleClick(event)}
          />
        )}
        <CurrencySelector
          disabled={isSyncing}
          onChange={(event) => handleClick(event)}
          onClose={handleClick}
          direction={direction}
          display="code"
        />
        <List style={{ padding: 0, margin: 0 }}>
          {nbAccount >= 1 && <Divider />}

          {account && !account.isLocal && direction == "left" && (
            <>
              <SyncButton onClick={(event) => handleClick(event)} />
            </>
          )}

          {nbAccount >= 1 && (
            <>
              <Link to="/settings" onClick={(event) => handleClick(event)}>
                <ListItem button>
                  <ListItemIcon>
                    <SettingsIcon />
                  </ListItemIcon>
                  <ListItemText primary="Settings" />
                </ListItem>
              </Link>
            </>
          )}

          {direction == "bottom" && (
            <ListItem button onClick={(_) => toggleHideMode()}>
              <ListItemIcon>
                {isHideMode ? <Visibility /> : <VisibilityOff />}
              </ListItemIcon>
              <ListItemText primary={isHideMode ? "Show" : "Hide"} />
            </ListItem>
          )}
        </List>
      </Popover>
    </div>
  );
}
