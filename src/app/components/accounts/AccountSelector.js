/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, {Component} from 'react';

import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import {List, ListItem} from 'material-ui/List';
import {Popover} from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import KeyboardArrowDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down';

import CurrencyStore from '../../stores/CurrencyStore';
import AccountStore from '../../stores/AccountStore';
import AccountActions from '../../actions/AccountActions';

const styles = {
  width: '100%',
  height: 'auto',
  textAlign: 'left',
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
  }

  handleOpen = (event) => {
    // This prevents ghost click.
    event.preventDefault();
    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  }

  handleRequestClose = () => {
    this.setState({
      account: AccountStore.selectedAccount(),
      open: false,
    });
  }

  componentWillMount() {
    AccountStore.addChangeListener(this.updateAccounts);
  }

  componentWillUnmount() {
    AccountStore.removeChangeListener(this.updateAccounts);
  }

  handleChange = (account) => {

    localStorage.setItem('account', account.id);
    AccountStore.emitChange();

    this.setState({
      account: AccountStore.selectedAccount(),
      open: false,
    });
  }

  render() {
    return (
      <div>
        <List>
          <ListItem
            primaryText={this.state.account.name}
            rightIcon={<KeyboardArrowDown />}
            onTouchTap={this.handleOpen}/>
        </List>
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{"horizontal":"right","vertical":"bottom"}}
          targetOrigin={{"horizontal":"right","vertical":"top"}}
          onRequestClose={this.handleRequestClose}
          >
          <Menu>
            { this.state.accounts.map((account) => (
              <MenuItem key={account.id} primaryText={account.name} onTouchTap={() => {this.handleChange(account); }} />
            )) }
          </Menu>
        </Popover>
      </div>
    );
  }
}

export default AccountSelector;
