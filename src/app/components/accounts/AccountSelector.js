/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router';

import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import { List, ListItem } from 'material-ui/List';
import { Popover } from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import KeyboardArrowDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down';

import CurrencyStore from '../../stores/CurrencyStore';
import AccountStore from '../../stores/AccountStore';
import AccountActions from '../../actions/AccountActions';

const styles = {
  list: {
    padding: 0,
  },
  manage: {
    textTransform: 'uppercase',
    fontSize: '0.8em',
    color: '#BBB',
    borderTop: '#DEDEDE solid 1px',
    padding: '4px 0px',
    lineHeight: '20px',
    textAlign: 'left',
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
    return (
      <div>
        {this.state.account ? (
          <div>
            <List style={styles.list}>
              <ListItem
                primaryText={this.state.account.name}
                rightIcon={<KeyboardArrowDown />}
                onTouchTap={this.handleOpen}
              />
            </List>
            <Popover
              open={this.state.open}
              anchorEl={this.state.anchorEl}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              targetOrigin={{ horizontal: 'right', vertical: 'top' }}
              onRequestClose={this.handleRequestClose}
            >
              <Menu>
                {this.state.accounts.map(account => (
                  <MenuItem
                    key={account.id}
                    primaryText={account.name}
                    onTouchTap={() => {
                      this.handleChange(account);
                    }}
                  />
                ))}
              </Menu>
            </Popover>
          </div>
        ) : (
          ''
        )}
      </div>
    );
  }
}

export default AccountSelector;
