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
import Settings from 'material-ui/svg-icons/action/settings';
import PowerSettingsNew from 'material-ui/svg-icons/action/power-settings-new';
import SwapHoriz from 'material-ui/svg-icons/action/swap-horiz';
import ListIcon from 'material-ui/svg-icons/action/list';
import LocalOfferIcon from 'material-ui/svg-icons/maps/local-offer';


import { cyan700} from 'material-ui/styles/colors';

import {List, ListItem} from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';

import AccountSelector from './accounts/AccountSelector';
import CurrencySelector from './currency/CurrencySelector';

const styles = {
  toolbar: {
    background: 'transparent',
  },
  separator: {
    margin: '0px 8px',
  },
};

class Layout extends Component {

  render() {
    return (
        <div id="mainContainer" >
          <nav id="menu">
            <List>
              <Link to="/transactions">
                <ListItem primaryText="Transactions" leftIcon={<ListIcon />} />
              </Link>
              <Link to="/changes">
                <ListItem primaryText="Changes" leftIcon={<SwapHoriz />} />
              </Link>
              <Link to="/categories">
                <ListItem primaryText="Categories" leftIcon={<LocalOfferIcon />}/>
              </Link>
            </List>
            <Divider />
            <List>
              <Link to="/settings">
                <ListItem primaryText="Settings" leftIcon={<Settings />}/>
              </Link>
              <Link to="/logout">
                <ListItem primaryText="Logout" leftIcon={<PowerSettingsNew />} />
              </Link>
            </List>
          </nav>
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

export default Layout;
