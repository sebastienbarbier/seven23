/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
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

import Popover from "@material-ui/core/Popover";

import Divider from "@material-ui/core/Divider";

import SettingsIcon from "@material-ui/icons/Settings";
import PowerSettingsNewIcon from "@material-ui/icons/PowerSettingsNew";

import SyncButton from "../accounts/SyncButton";
import AccountSelector from "../accounts/AccountSelector";
import CurrencySelector from "../currency/CurrencySelector";

export default function UserButton({ type, color }) {
  const profile = useSelector(state => state.user.profile);
  const isSyncing = useSelector(state => state.state.isSyncing);
  const accounts = useSelector(state => state.user.accounts);
  const badge = useSelector(state => state.sync.counter || 0);

  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const [first_letter, setFirstLetter] = useState(null);
  const [gravatar, setGravatar] = useState();

  useEffect(() => {
    const first_letter = profile.first_name
      ? profile.first_name[0]
      : profile.username[0];
    setFirstLetter(first_letter);

    setGravatar(`https://www.gravatar.com/avatar/${md5(profile.email)}?d=mp`);
  }, [profile]);

  const handleClick = (event = {}) => {
    setAnchorEl(event.currentTarget);
    setOpen(!open);
  };

  return (
    <div className="wrapperMobile">
      {type === "button" ? (
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
            {profile.first_name || profile.username}
          </span>
          <ExpandMore color="action" style={{ color: color }} />
        </Button>
      ) : (
        <MenuItem
          style={{ height: "50px", paddingTop: 0, paddingBottom: 0 }}
          onClick={handleClick}
        >
          <ListItemAvatar>
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
                  background: "rgba(0, 0, 0, 0.5)",
                  textTransform: "uppercase",
                  color: "white"
                }}
              >
                {first_letter}
              </Avatar>
            )}
          </ListItemAvatar>
          <ListItemText className="hideMobile">
            {profile.first_name || profile.username}
          </ListItemText>
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
        <SyncButton
          onClick={event => handleClick(event)}
          className="hideDesktop"
        />
        <Divider className="hideDesktop" />
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
          <Link to="/logout" onClick={event => handleClick(event)}>
            <ListItem button>
              <ListItemIcon>
                <PowerSettingsNewIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </Link>
        </List>
      </Popover>
    </div>
  );
}

// class UserButton extends Component {
//   constructor(props, context) {
//     super(props, context);
//     this.state = {
//       open: false,
//       anchorEl: null,
//       type: props.type,
//       color: props.color
//     };
//   }

//   handleClick = (event = {}) => {
//     const { currentTarget } = event;

//     this.setState(state => ({
//       anchorEl: currentTarget,
//       open: !state.open
//     }));
//   };

//   componentDidMount() {}

//   componentWillUnmount() {}

//   render() {
//     const { profile, isSyncing, accounts, badge } = this.props;
//     const { anchorEl, open, type, color } = this.state;

//     const first_letter = profile.first_name
//       ? profile.first_name[0]
//       : profile.username[0];
//     const gravatar_url = `https://www.gravatar.com/avatar/${md5(
//       profile.email
//     )}?d=mp`;
//     const id = open ? "user-popper" : null;
//     return (

//     );
//   }
// }

// UserButton.propTypes = {
//   isSyncing: PropTypes.bool.isRequired,
//   profile: PropTypes.object,
//   accounts: PropTypes.array.isRequired,
//   badge: PropTypes.number.isRequired
// };

// const mapStateToProps = (state, ownProps) => {
//   return {
//     profile: state.user.profile,
//     isSyncing: state.state.isSyncing,
//     isLoading: state.state.isLoading,
//     accounts: state.user.accounts,
//     badge: state.sync.counter || 0
//   };
// };

// export default connect(mapStateToProps)(UserButton);
