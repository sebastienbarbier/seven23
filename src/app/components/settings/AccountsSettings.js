/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "../../router";

import List from "@material-ui/core/List";
import ListSubheader from "@material-ui/core/ListSubheader";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";

import IconButton from "@material-ui/core/IconButton";
import Fab from "@material-ui/core/Fab";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";

import MoreVertIcon from "@material-ui/icons/MoreVert";
import ContentAdd from "@material-ui/icons/Add";

import AccountForm from "../settings/accounts/AccountForm";
import AccountDeleteForm from "../settings/accounts/AccountDeleteForm";

export default function AccountsSettings(props) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const accounts = useSelector(state => state.user.accounts);
  const server = useSelector(state => state.server);
  const { history } = useRouter();

  const _openAccount = (account = null) => {
    props.onModal(
      <AccountForm
        account={account}
        onSubmit={() => props.onModal()}
        onClose={() => props.onModal()}
      />
    );
  };

  const _deleteAccount = () => {
    props.onModal(
      <AccountDeleteForm
        account={account}
        onSubmit={() => {
          if (accounts.length === 1 && accounts[0].id === account.id) {
            history.push("/");
          } else {
            props.onModal();
          }
        }}
        onClose={() => props.onModal()}
      />
    );
  };

  const _openActionMenu = (event, account) => {
    setAnchorEl(event.currentTarget);
    setSelectedAccount(account);
  };

  const _closeActionMenu = () => {
    setAnchorEl(null);
    setSelectedAccount(null);
  };

  return (
    <div className="layout_content wrapperMobile">
      <List>
        <ListSubheader disableSticky={true}>{server.name}</ListSubheader>
        {accounts
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
                <IconButton onClick={event => _openActionMenu(event, account)}>
                  <MoreVertIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
      </List>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={_closeActionMenu}
      >
        <MenuItem
          onClick={() => {
            _closeActionMenu();
            _openAccount(selectedAccount);
          }}
        >
          Edit
        </MenuItem>
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
        onClick={_openAccount}
      >
        <ContentAdd />
      </Fab>
    </div>
  );
}
