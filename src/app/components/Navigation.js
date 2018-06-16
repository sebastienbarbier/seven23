/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { withTheme } from '@material-ui/core/styles';

import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';

import SettingsIcon from '@material-ui/icons/Settings';
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';
import SwapHorizIcon from '@material-ui/icons/SwapHoriz';
import ListIcon from '@material-ui/icons/List';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import MenuIcon from '@material-ui/icons/Menu';
import DashboardIcon from '@material-ui/icons/Dashboard';

import Drawer from 'material-ui/Drawer';

import { List } from 'material-ui/List';
import Divider from '@material-ui/core/Divider';
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
    this.history = props.history;

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
        <div id="hamburger_menu" onClick={this._openDrawer}>
          <MenuIcon style={styles.hamburger} />
        </div>
        <Drawer
          docked={false}
          width={260}
          style={styles.drawer}
          open={this.state.openDrawer}
          onRequestChange={open => this.setState({ openDrawer: open })}
        >
          <div className="drawer">
            {this.state.accounts && this.state.accounts.length != 0 ? (
              <div>
                <Subheader>Navigation</Subheader>
                <Link to={'/dashboard'} onClick={this._closeDrawer}>
                  <MenuItem leftIcon={<DashboardIcon color="action" />}>Dashboard</MenuItem>
                </Link>
                <Link to={'/transactions'} onClick={this._closeDrawer}>
                  <MenuItem leftIcon={<ListIcon color="action" />}>Transactions</MenuItem>
                </Link>
                <Link to="/categories" onClick={this._closeDrawer}>
                  <MenuItem leftIcon={<LocalOfferIcon color="action" />}>Categories</MenuItem>
                </Link>
                <Link to="/changes" onClick={this._closeDrawer}>
                  <MenuItem leftIcon={<SwapHorizIcon color="action" />}>Changes</MenuItem>
                </Link>
                <Divider light={true} />
                <AccountSelector />
                <CurrencySelector history={this.history} />
                <Divider light={true} />
                <Link to="/settings" onClick={this._closeDrawer}>
                  <MenuItem leftIcon={<SettingsIcon color="action" />}>Settings</MenuItem>
                </Link>
              </div>
            ) : (
              ''
            )}
            <Link to="/logout" onClick={this._closeDrawer}>
              <MenuItem leftIcon={<PowerSettingsNewIcon color="action" />}>Logout</MenuItem>
            </Link>
          </div>
        </Drawer>
        <nav>
          {this.state.accounts && this.state.accounts.length != 0 ? (
            <List style={{ padding: '2px' }}>
              <Link to={'/dashboard'}>
                <IconButton iconStyle={styles.icon} style={styles.iconButton}>
                  <DashboardIcon color="action" />
                </IconButton>
              </Link>
              <Link to={'/transactions'}>
                <IconButton iconStyle={styles.icon} style={styles.iconButton}>
                  <ListIcon color="action" />
                </IconButton>
              </Link>
              <Link to="/categories">
                <IconButton iconStyle={styles.icon} style={styles.iconButton}>
                  <LocalOfferIcon color="action" />
                </IconButton>
              </Link>
              <Link to="/changes">
                <IconButton iconStyle={styles.icon} style={styles.iconButton}>
                  <SwapHorizIcon color="action" />
                </IconButton>
              </Link>
            </List>
          ) : (
            ''
          )}

          {this.state.accounts && this.state.accounts.length != 0 ? (
            <Divider light={true} />
          ) : (
            ''
          )}
          <List>
            {this.state.accounts && this.state.accounts.length != 0 ? (
              <Link to="/settings">
                <IconButton iconStyle={styles.icon} style={styles.iconButton}>
                  <SettingsIcon color="action" />
                </IconButton>
              </Link>
            ) : (
              ''
            )}
            <Link to="/logout">
              <IconButton iconStyle={styles.icon} style={styles.iconButton}>
                <PowerSettingsNewIcon color="action" />
              </IconButton>
            </Link>
          </List>
        </nav>
      </div>
    );
  }
}

Navigation.propTypes = {
  theme: PropTypes.object.isRequired,
};

export default withTheme()(Navigation);
