/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from 'react';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import ExpandMore from '@material-ui/icons/ExpandMore';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import AccountStore from '../../stores/AccountStore';

const ITEM_HEIGHT = 48;

const styles = {
  list: {
    padding: 0,
  },
};

class AccountSelector extends Component {
  constructor(props) {
    super(props);
    this.state = {
      account: AccountStore.selectedAccount(),
      accounts: AccountStore.accounts,
      open: false,
      anchorEl: null,
    };
  }

  updateAccounts = () => {
    this.setState({
      account: AccountStore.selectedAccount(),
      accounts: AccountStore.accounts,
    });
  };

  handleOpen = event => {
    // This prevents ghost click.
    event.preventDefault();
    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  };

  handleRequestClose = () => {
    this.setState({
      account: AccountStore.selectedAccount(),
      open: false,
    });
  };

  componentWillMount() {
    AccountStore.addChangeListener(this.updateAccounts);
  }

  componentWillUnmount() {
    AccountStore.removeChangeListener(this.updateAccounts);
  }

  handleChange = account => {
    localStorage.setItem('account', account.id);
    AccountStore.emitChange();

    this.setState({
      account: AccountStore.selectedAccount(),
      open: false,
    });
  };

  render() {
    const { anchorEl, open } = this.state;

    return (
      <div>
        {this.state.account ? (
          <div>
            <List style={styles.list}>
              <ListItem
                button
                ref={node => {
                  this.target1 = node;
                }}
                aria-owns={open ? 'menu-list-grow' : null}
                aria-haspopup="true"
                onClick={this.handleOpen}
              >
                <ListItemText>{this.state.account.name}</ListItemText>
                <ExpandMore color="action" />
              </ListItem>
            </List>

            <Menu
              id="long-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={this.handleRequestClose}
              PaperProps={{
                style: {
                  maxHeight: ITEM_HEIGHT * 4.5,
                  width: 200,
                },
              }}
            >
              {this.state.accounts.map(account => (
                <MenuItem onClick={() => {
                  this.handleChange(account);
                }} key={account.id}>{account.name}</MenuItem>
              ))}
            </Menu>
          </div>
        ) : (
          ''
        )}
      </div>
    );
  }
}

export default AccountSelector;
