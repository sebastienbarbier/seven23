/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, {Component} from 'react';
import { Card, CardActions, CardText, CardTitle } from 'material-ui/Card';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn}
  from 'material-ui/Table';
import {blueGrey500, darkBlack, lightBlack} from 'material-ui/styles/colors';
import FlatButton from 'material-ui/FlatButton';
import {List, ListItem} from 'material-ui/List';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import Public from 'material-ui/svg-icons/social/public';
import UndoIcon from 'material-ui/svg-icons/content/undo';
import {red500, grey400} from 'material-ui/styles/colors';
import ContentAdd from 'material-ui/svg-icons/content/add';
import KeyboardArrowRight from 'material-ui/svg-icons/hardware/keyboard-arrow-right';

import UserStore from '../stores/UserStore';
import AccountForm from './settings/AccountForm';
import ProfileForm from './settings/ProfileForm';
import PasswordForm from './settings/PasswordForm';
import AccountDeleteForm from './settings/AccountDeleteForm';

import AccountStore from '../stores/AccountStore';
import AccountActions from '../actions/AccountActions';


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


class Settings extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      profile: UserStore.user,
      accounts: AccountStore.accounts,
      account: null,
      openPassword: false,
      openDeleteAccount: false,
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
      <div className="settingsLayout">
        <Card className="header">
          <header className="primaryColorBackground">
            <h1>Settings</h1>
          </header>
        </Card>
        <div className="cards">
          <div className="column">
             <Card>
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
          </div>
          <div className="column">
            <Card>
              <CardTitle title="Accounts" subtitle="You can manage multiple accounts with the same user." />
              <List>
                <Divider />
                {
                  this.state.accounts.sort((a, b) => {
                    return a.name < b.name ? -1 : 1;
                  }).map((account) => (
                    <ListItem
                      key={account.id}
                      primaryText={account.name}
                      disabled={true}
                      secondaryText={
                        <p>
                          { account.isPublic ? <span>Is public, </span> : ''}
                          Private account
                        </p>
                      }
                      rightIconButton={this.rightIconMenu(account)}/>
                  ))
                }

                <Divider />
                <ListItem
                  primaryText='Create new account'
                  secondaryText='You can create as many account as you want.'
                  rightIcon={<KeyboardArrowRight />}
                  onTouchTap={this._openAccount}/>
              </List>
            </Card>
          </div>
        </div>
      </div>
      <AccountForm account={this.state.account} open={this.state.openAccount}></AccountForm>
      <AccountDeleteForm account={this.state.account} open={this.state.openDeleteAccount}></AccountDeleteForm>
      <PasswordForm open={this.state.openPassword}></PasswordForm>
    </div>
    );
  }
}

// Inject router in context
Settings.contextTypes = {
 router: React.PropTypes.object.isRequired
};

export default Settings;
