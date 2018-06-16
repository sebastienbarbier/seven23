/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from 'react';

import muiThemeable from 'material-ui/styles/muiThemeable';
import { Card, CardTitle } from 'material-ui/Card';
import { List, ListItem } from 'material-ui/List';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import KeyboardArrowRight from 'material-ui/svg-icons/hardware/keyboard-arrow-right';

import UserStore from '../../stores/UserStore';
import PasswordForm from '../settings/profile/PasswordForm';
import EmailForm from '../settings/profile/EmailForm';

import grey from '@material-ui/core/colors/grey';

import AccountStore from '../../stores/AccountStore';

const iconButtonElement = (
  <IconButton touch={true}>
    <MoreVertIcon color={grey[400]} />
  </IconButton>
);

class ProfileSettings extends Component {
  constructor(props, context) {
    super(props, context);
    this.onModal = props.onModal;
    this.history = props.history;
    this.state = {
      profile: UserStore.user,
      token: localStorage.getItem('token'),
    };
  }

  _editPassword = () => {
    this.onModal(
      <PasswordForm
        onSubmit={() => this.onModal()}
        onClose={() => this.onModal()}
      />,
    );
  };

  _editMail = () => {
    this.onModal(
      <EmailForm
        onSubmit={() => this.onModal()}
        onClose={() => this.onModal()}
      />,
    );
  };

  _changeSelectedAccount = account => {
    localStorage.setItem('account', account.id);
    AccountStore.emitChange();
  };

  // Listener on profile change
  _updateProfile = profile => {
    if (profile && profile.username) {
      this.setState({
        profile: profile,
      });
    }
  };

  componentWillMount() {
    UserStore.addChangeListener(this._updateProfile);
  }

  componentDidMount() {}

  componentWillUnmount() {
    UserStore.removeChangeListener(this._updateProfile);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      primaryColor: nextProps.muiTheme.palette.primary1Color,
    });
  }

  rightIconMenu(account) {
    return (
      <IconMenu
        iconButtonElement={iconButtonElement}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
        targetOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        <MenuItem
          onClick={() => {
            this._openAccount(account);
          }}
        >
          Edit
        </MenuItem>
        <MenuItem onClick={() => this._deleteAccount(account)}>Delete</MenuItem>
      </IconMenu>
    );
  }

  render() {
    return (
      <div className="grid">
        <div className="small">
          <Card>
            <CardTitle title="Profile" subtitle="Edit your user profile" />
            <List>
              <Divider />
              <ListItem
                primaryText="Username"
                disabled={true}
                secondaryText={this.state.profile.username}
              />
              <ListItem
                primaryText="Email"
                onClick={this._editMail}
                rightIcon={<KeyboardArrowRight />}
                secondaryText={this.state.profile.email}
              />
              <Divider />
              <ListItem
                primaryText="Change password"
                onClick={this._editPassword}
                rightIcon={<KeyboardArrowRight />}
                secondaryText="Do not neglect security"
              />
            </List>
          </Card>
        </div>
      </div>
    );
  }
}

export default muiThemeable()(ProfileSettings);
