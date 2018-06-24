/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from 'react';

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';

import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import Divider from '@material-ui/core/Divider';
import grey from '@material-ui/core/colors/grey';

import MoreVertIcon from '@material-ui/icons/MoreVert';
import ContentAdd from '@material-ui/icons/Add';

import AccountForm from '../settings/accounts/AccountForm';
import AccountDeleteForm from '../settings/accounts/AccountDeleteForm';

import AccountStore from '../../stores/AccountStore';

class AccountsSettings extends Component {
  constructor(props, context) {
    super(props, context);
    this.onModal = props.onModal;
    this.state = {
      accounts: AccountStore.accounts,
      anchorEl: null,
      selectedAccount: null
    };
  }

  _openAccount = (account = null) => {
    this.onModal(
      <AccountForm
        account={account}
        onSubmit={() => this.onModal()}
        onClose={() => this.onModal()}
      />,
    );
  };

  _deleteAccount = (account = null) => {
    this.onModal(
      <AccountDeleteForm
        account={account}
        onSubmit={() => this.onModal()}
        onClose={() => this.onModal()}
      />,
    );
  };

  // Listener on ChangeEvent
  _updateAccounts = accounts => {
    this.setState({
      accounts: accounts,
    });
  };

  _openActionMenu = (event, account) => {
    this.setState({
      anchorEl: event.currentTarget,
      selectedAccount: account
    });
  };

  _closeActionMenu = () => {
    this.setState({
      anchorEl: null,
      selectedAccount: null
    });
  };

  componentWillMount() {
    AccountStore.addChangeListener(this._updateAccounts);
  }

  componentWillUnmount() {
    AccountStore.removeChangeListener(this._updateAccounts);
  }

  componentWillReceiveProps(nextProps) {
    this.modal = nextProps.modal;
  }

  render() {
    const { anchorEl } = this.state;
    return (
      <div className="grid">
        <div className="small">
          <Card>
            <CardHeader
              title="Accounts"
              subheader="You can manage multiple accounts with the same user."
            />
            <List>
              <Divider />
              {this.state.accounts
                .sort((a, b) => {
                  return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
                })
                .map(account => (
                  <ListItem
                    key={account.id}
                  >
                    <ListItemText primary={account.name} secondary="Private account" />
                    <ListItemSecondaryAction>
                      <IconButton
                        onClick={(event) => this._openActionMenu(event, account)}>
                        <MoreVertIcon  />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              <Divider />
              <ListItem
                button
                onClick={() => this._openAccount()}
              >
                <ListItemIcon>
                  <ContentAdd />
                </ListItemIcon>
                <ListItemText primary="Create new account" secondary="You can create as many account as you want." />
              </ListItem>
            </List>
          </Card>

          <Menu
            anchorEl={ anchorEl }
            open={ Boolean(anchorEl) }
            onClose={this._closeActionMenu}
          >
            <MenuItem
              onClick={() => {
                this._closeActionMenu();
                this._openAccount(this.state.selectedAccount)
              }}
            >
              Edit
            </MenuItem>
            <MenuItem
              onClick={() => {
                this._closeActionMenu();
                this._deleteAccount(this.state.selectedAccount);
              }}
            >
              Delete
            </MenuItem>
          </Menu>
        </div>
      </div>
    );
  }
}

export default AccountsSettings;
