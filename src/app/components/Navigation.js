/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Link, Switch, Redirect, Route} from 'react-router-dom';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
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

import { cyan700, orange800, green600, blueGrey500, blue700, red600, white } from 'material-ui/styles/colors';

import {List, ListItem} from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';

import AccountSelector from './accounts/AccountSelector';
import CurrencySelector from './currency/CurrencySelector';

// Router
import Dashboard from './Dashboard';
import Transactions from './Transactions';
import Changes from './Changes';
import Categories from './Categories';
import Settings from './Settings';
import Logout from './Logout';
import MonthView from './transactions/MonthView';

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
    padding: '14px 16px'
  },
  drawer: {
    paddingTop: 20,
  }
};

const PAGES = {
  'DASHBOARD'   : 'dashboardPage',
  'TRANSACTIONS': 'transactionsPage',
  'CHANGES'     : 'changesPage',
  'CATEGORIES'  : 'categoriesPage',
  'EVENTS'      : 'eventsPage',
  'SETTINGS'    : 'settingsPage'
};

class Layout extends Component {

  constructor(props, context) {
    super(props, context);
    this.context = context;

    this.location = props.location;

    let now = new Date();
    this.state = {
      background: 'transparent',
      color: white,
      openDrawer: false,
      page: PAGES.DASHBOARD,
      year: now.getFullYear(),
      month: now.getMonth()%12+1
    };

  }

   _changeColor = (route) => {
      if (route.pathname.startsWith('/dashboard')) {
        this.setState({
          page: PAGES.DASHBOARD,
          background: blue700,
        });
      } else if (route.pathname.startsWith('/transactions')) {
        this.setState({
          page: PAGES.TRANSACTIONS,
          background: cyan700,
        });
      } else if (route.pathname.startsWith('/changes')) {
        this.setState({
          page: PAGES.CHANGES,
          background: orange800,
        });
      } else if (route.pathname.startsWith('/categories')) {
        this.setState({
          page: PAGES.CATEGORIES,
          background: green600,
        });
      } else if (route.pathname.startsWith('/events')) {
        this.setState({
          page: PAGES.EVENTS,
          background: red600,
        });
      } else if (route.pathname.startsWith('/settings')) {
        this.setState({
          page: PAGES.SETTINGS,
          background: blueGrey500,
        });
      }
   };

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

  componentWillMount() {
  }

  componentDidMount() {
    this._changeColor(this.location);
  }

  componentWillUnmount() {
  }


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
              onRequestChange={(open) => this.setState({openDrawer: open})}
            >
            <Subheader>Navigation</Subheader>
            <Link to={`/dashboard`}  onTouchTap={this._closeDrawer}>
              <MenuItem leftIcon={<DashboardIcon />}>Dashboard</MenuItem>
            </Link>
            <Link to={`/transactions/${this.state.year}/${this.state.month}`}  onTouchTap={this._closeDrawer}>
              <MenuItem leftIcon={<ListIcon />}>Transactions</MenuItem>
            </Link>
            <Link to="/categories"  onTouchTap={this._closeDrawer}>
              <MenuItem leftIcon={<LocalOfferIconIcon />}>Categories</MenuItem>
            </Link>
            <Link to="/changes"  onTouchTap={this._closeDrawer}>
              <MenuItem leftIcon={<SwapHorizIcon />}>Changes</MenuItem>
            </Link>
            <Divider />
            <AccountSelector />
            <CurrencySelector />
            <Divider />
            <Link to="/settings"  onTouchTap={this._closeDrawer}>
              <MenuItem leftIcon={<SettingsIcon />}>Settings</MenuItem>
            </Link>
            <Link to="/logout"  onTouchTap={this._closeDrawer}>
              <MenuItem leftIcon={<PowerSettingsNewIcon />}>Logout</MenuItem>
            </Link>
          </Drawer>
        </MuiThemeProvider>
        <nav>
          <List style={{ padding: '2px'}}>
            <Link to={`/dashboard/`} >
              <IconButton iconStyle={styles.icon} style={styles.iconButton}>
                <DashboardIcon color={this.state.color} />
              </IconButton>
            </Link>
            <Link to={`/transactions/${this.state.year}/${this.state.month}`} >
              <IconButton iconStyle={styles.icon} style={styles.iconButton}>
                <ListIcon color={this.state.color} />
              </IconButton>
            </Link>
            <Link to="/categories" >
              <IconButton iconStyle={styles.icon} style={styles.iconButton}>
                <LocalOfferIconIcon color={this.state.color} />
              </IconButton>
            </Link>
            <Link to="/changes" >
              <IconButton iconStyle={styles.icon} style={styles.iconButton}>
                <SwapHorizIcon color={this.state.color} />
              </IconButton>
            </Link>
          </List>
          <Divider />
          <List>
            <Link to="/settings" >
              <IconButton iconStyle={styles.icon} style={styles.iconButton}>
                <SettingsIcon color={this.state.color} />
              </IconButton>
            </Link>
            <Link to="/logout" >
              <IconButton iconStyle={styles.icon} style={styles.iconButton}>
                <PowerSettingsNewIcon color={this.state.color} />
              </IconButton>
            </Link>
          </List>

        </nav>
      </div>
    );
  }
}

export default Layout;
