/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, {Component} from 'react';

import muiThemeable from 'material-ui/styles/muiThemeable';
import {Route, Switch } from 'react-router-dom';

import PropTypes from 'prop-types';
import { Card, CardActions, CardText, CardTitle } from 'material-ui/Card';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn}
  from 'material-ui/Table';
import {blueGrey500, darkBlack, lightBlack} from 'material-ui/styles/colors';
import FlatButton from 'material-ui/FlatButton';
import {List, ListItem, makeSelectable} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import Public from 'material-ui/svg-icons/social/public';
import UndoIcon from 'material-ui/svg-icons/content/undo';
import {red500, grey400} from 'material-ui/styles/colors';
import ContentAdd from 'material-ui/svg-icons/content/add';
import InfoIcon from 'material-ui/svg-icons/action/info';
import AccountBoxIcon from 'material-ui/svg-icons/action/account-box';
import PeopleIcon from 'material-ui/svg-icons/social/people';
import MoneyIcon from 'material-ui/svg-icons/editor/attach-money';
import StorageIcon from 'material-ui/svg-icons/device/storage';
import AvLibraryBooks from 'material-ui/svg-icons/av/library-books';
import KeyboardArrowRight from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import Paper from 'material-ui/Paper';

import UserStore from '../../stores/UserStore';
import AccountForm from '../settings/AccountForm';
import ProfileForm from '../settings/ProfileForm';
import PasswordForm from '../settings/PasswordForm';
import AccountDeleteForm from '../settings/AccountDeleteForm';
import AccountsSettings from '../accounts/AccountsSettings';

import AccountStore from '../../stores/AccountStore';
import AccountActions from '../../actions/AccountActions';

let SelectableList = makeSelectable(List);

const styles = {
  column: {
    width: '50%',
    padding: '5px',
    boxSizing: 'border-box',
  },
};

const iconButtonElement = (
  <IconButton touch={true}>
    <MoreVertIcon color={grey400} />
  </IconButton>
);


class ProfileSettings extends Component {

  constructor(props, context) {
    super(props, context);
    this.history = props.history;
    this.state = {
      profile: UserStore.user,
      accounts: AccountStore.accounts,
      account: null,
      page: props.history.location.pathname,
      openPassword: false,
      openDeleteAccount: false,
      primaryColor: props.muiTheme.palette.primary1Color,
    };
  }

  _openAccount = (account) => {
    this.setState({
      account: account,
      openAccount: true,
      openPassword: false,
      openDeleteAccount: false,
    });
  };

  _editPassword = () => {
    this.setState({
      openAccount: false,
      openPassword: true,
      openDeleteAccount: false,
    });
  };

  _deleteAccount = (account) => {
    this.setState({
      account: account,
      openAccount: false,
      openPassword: false,
      openDeleteAccount: true,
    });
  };

  _updateProfile = (profile) => {
    // If delete user, profile is null.
    if (profile) {
      let user = this.state.profile;
      user.email = profile.email;

      this.setState({
        profile: user,
        openAccount: false,
        openPassword: false,
        openDeleteAccount: false,
      });
    }
  };

  _updateAccounts = (accounts) => {
    this.setState({
      accounts: accounts,
      openAccount: false,
      openPassword: false,
      openDeleteAccount: false,
    });
  };

  _changeSelectedAccount = (account) => {
    localStorage.setItem('account', account.id);
    AccountStore.emitChange();
  };

  componentWillMount() {
    UserStore.addChangeListener(this._updateProfile);
    AccountStore.addChangeListener(this._updateAccounts);
  }

  componentDidMount() {
  }

  componentWillUnmount() {
    UserStore.removeChangeListener(this._updateProfile);
    AccountStore.removeChangeListener(this._updateAccounts);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      openAccount: false,
      openPassword: false,
      openDeleteAccount: false,
      primaryColor: nextProps.muiTheme.palette.primary1Color
    });
  }

  rightIconMenu(account) {
    return (
      <IconMenu
        iconButtonElement={iconButtonElement}
        anchorOrigin={{horizontal: 'right', vertical: 'top'}}
        targetOrigin={{horizontal: 'right', vertical: 'top'}}>
        <MenuItem onTouchTap={() => {this._openAccount(account); }}>Edit</MenuItem>
        <MenuItem onTouchTap={() => this._deleteAccount(account) }>Delete</MenuItem>
      </IconMenu>
    );
  }

  render() {
    return (
      <div>
        <Card style={{maxWidth: '400px', marginTop: '10px'}}>
          <CardTitle title="Profile" subtitle="Edit your user profile" />
          <List>
            <Divider />
            <ListItem
              primaryText="Username"
              disabled={true}
              secondaryText={ this.state.profile.username }/>
            <ListItem
              primaryText="Email"
              disabled={true}
              secondaryText={ this.state.profile.email }/>
            <Divider />
            <ListItem
              primaryText="Password"
              onTouchTap={this._editPassword}
              rightIcon={<KeyboardArrowRight />}
              secondaryText="Change password"/>
          </List>
        </Card>
        <PasswordForm open={this.state.openPassword}></PasswordForm>
      </div>
    );
  }
}

export default muiThemeable()(ProfileSettings);
