/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';

import SettingsIcon from '@material-ui/icons/Settings';
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';
import SwapHorizIcon from '@material-ui/icons/SwapHoriz';
import ListIcon from '@material-ui/icons/List';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import MenuIcon from '@material-ui/icons/Menu';
import DashboardIcon from '@material-ui/icons/Dashboard';

import Drawer from '@material-ui/core/Drawer';

import List from '@material-ui/core/List';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';

import ListSubheader from '@material-ui/core/ListSubheader';

import AccountSelector from './accounts/AccountSelector';
import CurrencySelector from './currency/CurrencySelector';

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
  drawer: {
    paddingTop: 20
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
    };
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
    const { accounts } = this.props;
    return (
      <div id="menu">
        <IconButton id="hamburger_menu" onClick={this._openDrawer} style={{ marginTop: 8, marginLeft: 5 }}>
          <MenuIcon style={{ color: 'white' }} />
        </IconButton>
        <Drawer
          style={styles.drawer}
          open={Boolean(this.state.openDrawer)}
          onClose={() => this.setState({ openDrawer: false })}
        >
          <div className="drawer" style={{ width: 260 }}>
            {accounts && accounts.length != 0 ? (
              <div>
                <ListSubheader>Navigation</ListSubheader>
                <Link to="/dashboard" onClick={this._closeDrawer}>
                  <MenuItem>
                    <ListItemIcon><DashboardIcon /></ListItemIcon>
                    <ListItemText>Dashboard</ListItemText>
                  </MenuItem>
                </Link>
                <Link to="/transactions" onClick={this._closeDrawer}>
                  <MenuItem>
                    <ListItemIcon><ListIcon /></ListItemIcon>
                    <ListItemText>Transactions</ListItemText>
                  </MenuItem>
                </Link>
                <Link to="/categories" onClick={this._closeDrawer}>
                  <MenuItem>
                    <ListItemIcon><LocalOfferIcon /></ListItemIcon>
                    <ListItemText>Categories</ListItemText>
                  </MenuItem>
                </Link>
                <Link to="/changes" onClick={this._closeDrawer}>
                  <MenuItem>
                    <ListItemIcon><SwapHorizIcon /></ListItemIcon>
                    <ListItemText>Changes</ListItemText>
                  </MenuItem>
                </Link>
                <Divider light={true} />
                <AccountSelector />
                <CurrencySelector history={this.history} />
                <Divider light={true} />
                <Link to="/settings" onClick={this._closeDrawer}>
                  <MenuItem>
                    <ListItemIcon><SettingsIcon /></ListItemIcon>
                    <ListItemText>Settings</ListItemText>
                  </MenuItem>
                </Link>
              </div>
            ) : (
              ''
            )}
            <Link to="/logout" onClick={this._closeDrawer}>
              <MenuItem>
                <ListItemIcon><PowerSettingsNewIcon /></ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
            </Link>
          </div>
        </Drawer>
        <nav>
          {accounts && accounts.length != 0 ? (
            <List style={{ padding: '24px 2px 2px 2px' }}>
              <Link to={'/dashboard'}>
                <IconButton style={styles.iconButton}>
                  <DashboardIcon style={{ color: 'white' }} />
                </IconButton>
              </Link>
              <Link to={'/transactions'}>
                <IconButton style={styles.iconButton}>
                  <ListIcon style={{ color: 'white' }} />
                </IconButton>
              </Link>
              <Link to="/categories">
                <IconButton style={styles.iconButton}>
                  <LocalOfferIcon style={{ color: 'white' }} />
                </IconButton>
              </Link>
              <Link to="/changes">
                <IconButton style={styles.iconButton}>
                  <SwapHorizIcon style={{ color: 'white' }} />
                </IconButton>
              </Link>
            </List>
          ) : (
            ''
          )}

          {accounts && accounts.length != 0 ? (
            <Divider light={true} />
          ) : (
            ''
          )}
          <List>
            {accounts && accounts.length != 0 ? (
              <Link to="/settings">
                <IconButton style={styles.iconButton}>
                  <SettingsIcon style={{ color: 'white' }} />
                </IconButton>
              </Link>
            ) : (
              ''
            )}
            <Link to="/logout">
              <IconButton style={styles.iconButton}>
                <PowerSettingsNewIcon style={{ color: 'white' }} />
              </IconButton>
            </Link>
          </List>
        </nav>
      </div>
    );
  }
}

Navigation.propTypes = {
  accounts: PropTypes.array,
};

const mapStateToProps = (state, ownProps) => {
  return {
    accounts: state.user.accounts
  };
};

export default connect(mapStateToProps)(Navigation);
