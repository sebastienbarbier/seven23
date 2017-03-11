/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, {Component} from 'react';
import {Link} from 'react-router';

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

import Drawer from 'material-ui/Drawer';

import { cyan700, orange800, green600, blueGrey500, white } from 'material-ui/styles/colors';

import {List, ListItem} from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';

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
  'TRANSACTIONS': 'transactionsPage',
  'CHANGES'     : 'changesPage',
  'CATEGORIES'  : 'categoriesPage',
  'SETTINGS'    : 'settingsPage'
};

class Layout extends Component {

  constructor(props, context) {
    super(props, context);
    this.context = context;
    this.state = {
      background: 'transparent',
      color: white,
      openDrawer: false,
      page: PAGES.TRANSACTIONS,
    };
  }

   _changeColor = (route) => {
    if (route.pathname.startsWith('/transactions')) {
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
    this.removeListener = this.context.router.listen(this._changeColor);
  }

  componentDidMount() {
    this._changeColor(this.context.router.getCurrentLocation());
  }

  componentWillUnmount() {
    this.removeListener();
  }


  render() {
    return (
        <div id="mainContainer" className={this.state.page}>
          <div id="menu" className="primaryColorBackground">
            <div id="hamburger_menu" onTouchTap={this._openDrawer}>
              <MenuIcon style={styles.hamburger} />
            </div>

            <Drawer
                docked={false}
                width={260}
                style={styles.drawer}
                open={this.state.openDrawer}
                onRequestChange={(open) => this.setState({openDrawer: open})}
              >
              <Subheader>Navigation</Subheader>
              <Link to="/transactions" activeClassName="active" onTouchTap={this._closeDrawer}>
                <MenuItem leftIcon={<ListIcon />}>Transactions</MenuItem>
              </Link>
              <Link to="/changes" activeClassName="active" onTouchTap={this._closeDrawer}>
                <MenuItem leftIcon={<SwapHorizIcon />}>Changes</MenuItem>
              </Link>
              <Link to="/categories" activeClassName="active" onTouchTap={this._closeDrawer}>
                <MenuItem leftIcon={<LocalOfferIconIcon />}>Categories</MenuItem>
              </Link>
              <Divider />
              <AccountSelector />
              <CurrencySelector />
              <Divider />
              <Link to="/settings" activeClassName="active" onTouchTap={this._closeDrawer}>
                <MenuItem leftIcon={<SettingsIcon />}>Settings</MenuItem>
              </Link>
              <Link to="/logout" activeClassName="active" onTouchTap={this._closeDrawer}>
                <MenuItem leftIcon={<PowerSettingsNewIcon />}>Logout</MenuItem>
              </Link>
            </Drawer>


            <nav>
              <List style={{ padding: '2px'}}>
                <Link to="/transactions" activeClassName="active">
                  <IconButton iconStyle={styles.icon} style={styles.iconButton}>
                    <ListIcon color={this.state.color} />
                  </IconButton>
                </Link>
                <Link to="/changes" activeClassName="active">
                  <IconButton iconStyle={styles.icon} style={styles.iconButton}>
                    <SwapHorizIcon color={this.state.color} />
                  </IconButton>
                </Link>
                <Link to="/categories" activeClassName="active">
                  <IconButton iconStyle={styles.icon} style={styles.iconButton}>
                    <LocalOfferIconIcon color={this.state.color} />
                  </IconButton>
                </Link>
              </List>
              <Divider />
              <List>
                <Link to="/settings" activeClassName="active">
                  <IconButton iconStyle={styles.icon} style={styles.iconButton}>
                    <SettingsIcon color={this.state.color} />
                  </IconButton>
                </Link>
                <Link to="/logout" activeClassName="active">
                  <IconButton iconStyle={styles.icon} style={styles.iconButton}>
                    <PowerSettingsNewIcon color={this.state.color} />
                  </IconButton>
                </Link>
              </List>

            </nav>

          </div>
          <div id="main">
            <Toolbar id="toolbar" style={styles.toolbar}>
              <ToolbarGroup firstChild={true}>

              </ToolbarGroup>
              <ToolbarGroup>
                <AccountSelector />
                <ToolbarSeparator style={styles.separator} />
                <CurrencySelector />
              </ToolbarGroup>
            </Toolbar>
            <div id="content">
              {this.props.children}
            </div>
          </div>
        </div>
    );
  }
}

// Inject router in context
 Layout.contextTypes = {
   router: React.PropTypes.object.isRequired
 };


export default Layout;
