/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from 'react-router-dom';

import List from "@material-ui/core/List";
import ListSubheader from "@material-ui/core/ListSubheader";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";

import IconButton from "@material-ui/core/IconButton";
import Fab from "@material-ui/core/Fab";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Divider from "@material-ui/core/Divider";

import MoreVertIcon from "@material-ui/icons/MoreVert";
import ContentAdd from "@material-ui/icons/Add";

import AccountsActions from "../../actions/AccountsActions";
import AccountForm from "../settings/accounts/AccountForm";
import AccountDeleteForm from "../settings/accounts/AccountDeleteForm";

export default function AccountsSettings(props) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const accounts = useSelector(state => state.accounts);
  const server = useSelector(state => state.server);
  const isLogged = useSelector(state => state.server.isLogged);
  const navigate = useNavigate();

  const _openAccount = (account = null) => {
    props.onModal(
      <AccountForm
        account={account}
        onSubmit={() => props.onModal()}
        onClose={() => props.onModal()}
      />
    );
  };

  const _deleteAccount = account => {
    props.onModal(
      <AccountDeleteForm
        account={account}
        onSubmit={() => {
          const mergedList = [...accounts.remote, ...accounts.local];
          if (mergedList.length === 1 && mergedList[0].id === account.id) {
            navigate("/");
          } else {
            props.onModal();
          }
        }}
        onClose={() => props.onModal()}
      />
    );
  };

  const _openActionMenu = (event, account) => {
    setOpen(true);
    setAnchorEl(event.currentTarget);
    setSelectedAccount(account);
  };

  const _closeActionMenu = () => {
    setOpen(false);
    setTimeout(() => setAnchorEl(null), 500);
  };

  const _migrateAccount = (account = selectedAccount) => {
    if (account) {
      dispatch(AccountsActions.migrate(account))
        .then(() => {})
        .catch(() => {});
    }
  };

  return (
    <div className="layout_content wrapperMobile">
      {accounts.remote && accounts.remote.length ? (
        <List>
          <ListSubheader disableSticky={true}>{server.name}</ListSubheader>
          {accounts.remote
            .sort((a, b) => {
              if (a.name.toLowerCase() < b.name.toLowerCase()) {
                return -1;
              } else if (a.name.toLowerCase() > b.name.toLowerCase()) {
                return 1;
              } else if (a.id < b.id) {
                return -1;
              } else {
                return 1;
              }
            })
            .map(account => (
              <ListItem key={account.id}>
                <ListItemText primary={account.name} />
                <ListItemSecondaryAction>
                  <IconButton
                    onClick={event => _openActionMenu(event, account)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
        </List>
      ) : (
        ""
      )}

      {accounts.local && accounts.local.length ? (
        <List>
          <ListSubheader disableSticky={true}>On device</ListSubheader>
          {accounts.local
            .sort((a, b) => {
              if (a.name.toLowerCase() < b.name.toLowerCase()) {
                return -1;
              } else if (a.name.toLowerCase() > b.name.toLowerCase()) {
                return 1;
              } else if (a.id < b.id) {
                return -1;
              } else {
                return 1;
              }
            })
            .map(account => (
              <ListItem key={account.id}>
                <ListItemText primary={account.name} />
                <ListItemSecondaryAction>
                  <IconButton
                    onClick={event => _openActionMenu(event, account)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
        </List>
      ) : (
        ""
      )}
      <Menu anchorEl={anchorEl} open={Boolean(open)} onClose={_closeActionMenu}>
        <MenuItem
          onClick={() => {
            _closeActionMenu();
            _openAccount(selectedAccount);
          }}
        >
          Edit
        </MenuItem>
        <Divider />
        {selectedAccount && isLogged ? (
          <MenuItem
            onClick={() => {
              _migrateAccount(selectedAccount);
              _closeActionMenu();
            }}
          >
            {selectedAccount.isLocal
              ? "Migrate to server"
              : "Migrate to device"}
          </MenuItem>
        ) : (
          ""
        )}
        <MenuItem
          onClick={() => {
            _closeActionMenu();
            _deleteAccount(selectedAccount);
          }}
        >
          Delete
        </MenuItem>
      </Menu>
      <Fab
        color="primary"
        className="layout_fab_button show"
        aria-label="Add"
        onClick={() => _openAccount()}
      >
        <ContentAdd />
      </Fab>
    </div>
  );
}