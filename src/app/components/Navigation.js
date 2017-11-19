/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Switch, Redirect, Route } from 'react-router-dom';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
  ToolbarTitle,
} from 'material-ui/Toolbar';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import MenuItem from 'material-ui/MenuItem';
import DropDownMenu from 'material-ui/DropDownMenu';
import RaisedButton from 'material-ui/RaisedButton';

import NavigationExpandMoreIcon from 'material-ui/svg-icons/navigation/expand-more';
import SettingsIcon from 'material-ui/svg-icons/action/settings';
import PowerSettingsNewIcon from 'material-ui/svg-icons/action/power-settings-new';
import SwapHorizIcon from 'material-ui/svg-icons/action/swap-horiz';
import ListIcon from 'material-ui/svg-icons/action/list';
import LocalOfferIconIcon from 'material-ui/svg-icons/maps/local-offer';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';
import DashboardIcon from 'material-ui/svg-icons/action/dashboard';
import EventIcon from 'material-ui/svg-icons/action/event';

import Drawer from 'material-ui/Drawer';

import {
  cyan700,
  orange800,
  green600,
  blueGrey500,
  blue700,
  red600,
  white,
} from 'material-ui/styles/colors';

import { List, ListItem } from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';

import AccountSelector from './accounts/AccountSelector';
import CurrencySelector from './currency/CurrencySelector';

import UserStore from '../stores/UserStore';
import AccountStore from '../stores/AccountStore';

const styles = {
  toolbar: {
    background: '#D8D8D8',
  },
  separator: {
    margin: '0px 8px',
  },
  iconButton: {
    width: 55,
    height: 55,
  },
  icon: {
    width: 25,
    height: 25,
  },
  hamburger: {
    color: 'white',
    width: 30,
    height: 30,
    padding: '14px 16px',
  },
  drawer: {
    paddingTop: 20,
  },
};

class Navigation extends Component {
  constructor(props, context) {
    super(props, context);
    this.context = context;

    this.location = props.location;

    let now = new Date();
    this.state = {
      openDrawer: false,
      accounts: AccountStore.accounts,
    };
  }

  updateAccounts = () => {
    this.setState({
      accounts: AccountStore.accounts,
    });
  };

  _userUpdate = () => {
    this.setState({
      accounts: AccountStore.accounts,
    });
  };

  componentWillMount() {
    AccountStore.addChangeListener(this.updateAccounts);
    UserStore.addChangeListener(this._userUpdate);
  }

  componentWillUnmount() {
    AccountStore.removeChangeListener(this.updateAccounts);
    UserStore.removeChangeListener(this._userUpdate);
  }

  _openDrawer = () => {
    this.setState({
      openDrawer: true,
    });
  };

  _closeDrawer = () => {
    this.setState({
      openDrawer: false,
    });
  };

  render() {
    return (
      <div id="menu" className="primaryColorBackground">
        <div id="hamburger_menu" onTouchTap={this._openDrawer}>
          <MenuIcon style={styles.hamburger} />
        </div>
        <MuiThemeProvider>
          <Drawer
            docked={false}
            width={260}
            style={styles.drawer}
            open={this.state.openDrawer}
            onRequestChange={open => this.setState({ openDrawer: open })}
          >
            {this.state.accounts && this.state.accounts.length != 0 ? (
              <div>
                <Subheader>Navigation</Subheader>
                <Link to={`/dashboard`} onTouchTap={this._closeDrawer}>
                  <MenuItem leftIcon={<DashboardIcon />}>Dashboard</MenuItem>
                </Link>
                <Link to={`/transactions`} onTouchTap={this._closeDrawer}>
                  <MenuItem leftIcon={<ListIcon />}>Transactions</MenuItem>
                </Link>
                <Link to="/categories" onTouchTap={this._closeDrawer}>
                  <MenuItem leftIcon={<LocalOfferIconIcon />}>
                    Categories
                  </MenuItem>
                </Link>
                <Link to="/changes" onTouchTap={this._closeDrawer}>
                  <MenuItem leftIcon={<SwapHorizIcon />}>Changes</MenuItem>
                </Link>
                <Divider />
                <AccountSelector />
                <CurrencySelector />
                <Divider />
                <Link to="/settings" onTouchTap={this._closeDrawer}>
                  <MenuItem leftIcon={<SettingsIcon />}>Settings</MenuItem>
                </Link>
              </div>
            ) : (
              ''
            )}
            <Link to="/logout" onTouchTap={this._closeDrawer}>
              <MenuItem leftIcon={<PowerSettingsNewIcon />}>Logout</MenuItem>
            </Link>
          </Drawer>
        </MuiThemeProvider>
        <nav>
          {this.state.accounts && this.state.accounts.length != 0 ? (
            <List style={{ padding: '2px' }}>
              <Link to={`/dashboard`}>
                <IconButton iconStyle={styles.icon} style={styles.iconButton}>
                  <DashboardIcon />
                </IconButton>
              </Link>
              <Link to={`/transactions`}>
                <IconButton iconStyle={styles.icon} style={styles.iconButton}>
                  <ListIcon />
                </IconButton>
              </Link>
              <Link to="/categories">
                <IconButton iconStyle={styles.icon} style={styles.iconButton}>
                  <LocalOfferIconIcon />
                </IconButton>
              </Link>
              <Link to="/changes">
                <IconButton iconStyle={styles.icon} style={styles.iconButton}>
                  <SwapHorizIcon />
                </IconButton>
              </Link>
            </List>
          ) : (
            ''
          )}

          {this.state.accounts && this.state.accounts.length != 0 ? (
            <Divider />
          ) : (
            ''
          )}
          <List>
            {this.state.accounts && this.state.accounts.length != 0 ? (
              <Link to="/settings">
                <IconButton iconStyle={styles.icon} style={styles.iconButton}>
                  <SettingsIcon />
                </IconButton>
              </Link>
            ) : (
              ''
            )}
            <Link to="/logout">
              <IconButton iconStyle={styles.icon} style={styles.iconButton}>
                <PowerSettingsNewIcon />
              </IconButton>
            </Link>
          </List>
        </nav>
      </div>
    );
  }
}

export default Navigation;
