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
  header: {
    margin: '5px 5px',
    color: 'white',
    background: blueGrey500,
    padding: '20px 0px 30px 20px',
  },
  headerTitle: {
    color: 'white',
    fontSize: '4em',
  },
  headerText: {
    color: 'white',
  },
  actions: {
    textAlign: 'right',
  },
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  column: {
    width: '50%',
    padding: '5px',
    boxSizing: 'border-box',
  },
  selected: {
    background: 'blue',
  }
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
      <Card style={styles.header}>
        <CardText style={styles.headerText}>
          <h1 style={styles.headerTitle}>Settings</h1>
        </CardText>
      </Card>
      <div style={styles.wrapper}>
        <div style={styles.column}>
           <Card>
            <CardTitle title="Profile" subtitle="Edit your user profile" />
            <CardText>
              <Table>
                <TableHeader
                  displaySelectAll={false}
                  adjustForCheckbox={false}>
                  <TableRow>
                    <TableHeaderColumn>Username</TableHeaderColumn>
                    <TableHeaderColumn>Email</TableHeaderColumn>
                  </TableRow>
                </TableHeader>
                <TableBody
                  displayRowCheckbox={false}
                  showRowHover={true}
                  stripedRows={false}
                >
                  <TableRow>
                      <TableRowColumn>{ this.state.profile.username }</TableRowColumn>
                      <TableRowColumn>{ this.state.profile.email }</TableRowColumn>
                    </TableRow>
                </TableBody>
              </Table>
            </CardText>
            <CardActions style={styles.actions}>
              <FlatButton
                label="Change password"
                onTouchTap={this._editPassword}
              />
            </CardActions>
          </Card>
        </div>
        <div style={styles.column}>
          <Card>
            <CardTitle title="Accounts" subtitle="You can manage multiple accounts with the same account." />
            <List>
              {
                this.state.accounts.sort((a, b) => {
                  return a.name < b.name ? -1 : 1;
                }).map((account) => (
                  <ListItem
                    key={account.id}
                    primaryText={account.name}
                    onTouchTap={() => this._changeSelectedAccount(account) }
                    secondaryText={
                      <p>
                        { account.isPublic ? <span>Is public, </span> : ''}
                        Private account
                      </p>
                    }
                    rightIconButton={this.rightIconMenu(account)}/>
                ))
              }
              <ListItem
                primaryText='Add an account'
                leftIcon={<ContentAdd />}
                onTouchTap={this._openAccount}/>
            </List>
          </Card>
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
