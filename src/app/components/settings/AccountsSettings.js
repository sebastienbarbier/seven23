/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from 'react';

import muiThemeable from 'material-ui/styles/muiThemeable';
import { Card, CardTitle } from 'material-ui/Card';
import { List, ListItem } from 'material-ui/List';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import { grey400 } from 'material-ui/styles/colors';
import ContentAdd from 'material-ui/svg-icons/content/add';

import AccountForm from '../settings/accounts/AccountForm';
import AccountDeleteForm from '../settings/accounts/AccountDeleteForm';

import AccountStore from '../../stores/AccountStore';

const iconButtonElement = (
  <IconButton touch={true}>
    <MoreVertIcon color={grey400} />
  </IconButton>
);

class AccountsSettings extends Component {
  constructor(props, context) {
    super(props, context);
    this.onModal = props.onModal;
    this.state = {
      accounts: AccountStore.accounts,
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

  componentWillMount() {
    AccountStore.addChangeListener(this._updateAccounts);
  }

  componentWillUnmount() {
    AccountStore.removeChangeListener(this._updateAccounts);
  }

  componentWillReceiveProps(nextProps) {
    this.modal = nextProps.modal;
    this.setState({
      primaryColor: nextProps.muiTheme.palette.primary1Color,
    });
  }

  rightIconMenu(account) {
    return (
      <IconMenu
        iconButtonElement={iconButtonElement}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
        targetOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        <MenuItem onClick={() => this._openAccount(account)}>Edit</MenuItem>
        <MenuItem onClick={() => this._deleteAccount(account)}>Delete</MenuItem>
      </IconMenu>
    );
  }

  render() {
    return (
      <div className="grid">
        <div className="small">
          <Card>
            <CardTitle
              title="Accounts"
              subtitle="You can manage multiple accounts with the same user."
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
                    primaryText={account.name}
                    disabled={true}
                    secondaryText={
                      <p>
                        {account.isPublic ? <span>Is public, </span> : ''}
                        Private account
                      </p>
                    }
                    rightIconButton={this.rightIconMenu(account)}
                  />
                ))}
              <Divider />
              <ListItem
                primaryText="Create new account"
                secondaryText="You can create as many account as you want."
                leftIcon={<ContentAdd />}
                onClick={() => this._openAccount()}
              />
            </List>
          </Card>
        </div>
      </div>
    );
  }
}

export default muiThemeable()(AccountsSettings);
