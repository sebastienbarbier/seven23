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


import { cyan700, orange800, green600, blueGrey500, white } from 'material-ui/styles/colors';

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
  iconButton: {
    width: 55,
    height: 55,
  },
  icon: {
    width: 25,
    height: 25,
  }
};

class Layout extends Component {

  constructor(props, context) {
     super(props, context);
     this.context = context;
     this.state = {
        background: 'transparent',
        color: white,
     };
   }

   _changeColor = (route) => {
    if (route.pathname.startsWith('/transactions')) {
        this.setState({
          background: cyan700,
        });
      } else if (route.pathname.startsWith('/changes')) {
        this.setState({
          background: orange800,
        });
      } else if (route.pathname.startsWith('/categories')) {
        this.setState({
          background: green600,
        });
      } else if (route.pathname.startsWith('/settings')) {
        this.setState({
          background: blueGrey500,
        });
      }
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
        <div id="mainContainer" >
          <nav id="menu" style={{ background: this.state.background }}>
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
