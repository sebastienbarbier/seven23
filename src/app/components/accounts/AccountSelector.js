/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";

import ExpandMore from "@mui/icons-material/ExpandMore";
import NavigateNext from "@mui/icons-material/NavigateNext";

import Popover from "@mui/material/Popover";

import AccountsActions from "../../actions/AccountsActions";

const styles = {
  list: {
    padding: 0,
  },
};

export default function AccountSelector(props) {
  const dispatch = useDispatch();

  const [anchorEl, setAnchorEl] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const server = useSelector((state) => state.server);
  const account = useSelector((state) => state.account);
  const accounts = useSelector((state) => state.accounts);

  const handleOpen = (event) => {
    event.preventDefault();
    if (props.onClick) {
      props.onClick();
    }

    setAnchorEl(event.currentTarget);
    setIsOpen(true);
  };
  const handleChange = (account) => {
    if (props.onChange) {
      props.onChange();
    }

    dispatch(AccountsActions.switchAccount(account));
    setIsOpen(false);
  };

  return (
    <div className={props.className}>
      {account ? (
        <>
          <List style={styles.list}>
            <ListItem
              button
              aria-owns={isOpen ? "menu-list-grow" : null}
              aria-haspopup="true"
              disabled={props.disabled}
              onClick={handleOpen}
            >
              <ListItemText>{account.name}</ListItemText>
              {props.direction == "bottom" ? (
                <ExpandMore color="action" />
              ) : (
                <NavigateNext color="action" />
              )}
            </ListItem>
          </List>

          <Popover
            id={isOpen ? "long-menu" : null}
            open={isOpen}
            onClose={() => setIsOpen(false)}
            anchorEl={anchorEl}
            anchorOrigin={
              props.direction == "bottom"
                ? {
                    vertical: "bottom",
                    horizontal: "left",
                  }
                : {
                    vertical: "bottom",
                    horizontal: "right",
                  }
            }
            transformOrigin={
              props.direction == "bottom"
                ? {
                    vertical: "top",
                    horizontal: "left",
                  }
                : {
                    vertical: "bottom",
                    horizontal: "left",
                  }
            }
            PaperProps={{
              style: {
                maxHeight: "70vh",
                width: 200,
              },
            }}
          >
            {accounts.remote && accounts.remote.length ? (
              <List style={{ paddingTop: 0, marginTop: 0 }}>
                <ListSubheader disableSticky={true}>
                  {server.name}
                </ListSubheader>
                {accounts.remote.map((item) => (
                  <ListItem
                    key={item.id}
                    onClick={() => {
                      handleChange(item);
                    }}
                    selected={account.id === item.id}
                    button
                  >
                    <ListItemText primary={item.name} />
                  </ListItem>
                ))}
              </List>
            ) : (
              ""
            )}

            {accounts.local && accounts.local.length ? (
              <List style={{ paddingTop: 0, marginTop: 0 }}>
                <ListSubheader disableSticky={true}>On device</ListSubheader>
                {accounts.local.map((item) => (
                  <ListItem
                    key={item.id}
                    onClick={() => {
                      handleChange(item);
                    }}
                    selected={account.id === item.id}
                    button
                  >
                    <ListItemText primary={item.name} />
                  </ListItem>
                ))}
              </List>
            ) : (
              ""
            )}
          </Popover>
        </>
      ) : (
        ""
      )}
    </div>
  );
}
