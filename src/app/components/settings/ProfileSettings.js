/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';

import Divider from '@material-ui/core/Divider';
import Switch from '@material-ui/core/Switch';

import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';

import UserStore from '../../stores/UserStore';
import UserActions from '../../actions/UserActions';
import PasswordForm from '../settings/profile/PasswordForm';
import EmailForm from '../settings/profile/EmailForm';

import AccountStore from '../../stores/AccountStore';


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

  _switchTheme = () => {
    const { dispatch, state } = this.props;
    dispatch(UserActions.setTheme(state.user.theme === 'dark' ? 'light' : 'dark'));
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

  componentWillUnmount() {
    UserStore.removeChangeListener(this._updateProfile);
  }

  render() {

    const { state } = this.props;

    return (
      <div className="grid">
        <div className="small">
          <Card>
            <CardHeader title="Profile" subtitle="Edit your user profile" />
            <List>
              <Divider />
              <ListItem>
                <ListItemText primary="Username" secondary={this.state.profile.username}/>
              </ListItem>
              <ListItem
                button
                onClick={this._editMail}
              >
                <ListItemText primary="Email" secondary={this.state.profile.email}/>
                <KeyboardArrowRight />
              </ListItem>
              <Divider />
              <ListItem
                button
                onClick={this._editPassword}
              >
                <ListItemText primary="Change password" secondary="Do not neglect security"/>
                <KeyboardArrowRight />
              </ListItem>
            </List>
          </Card>
          <Card style={{ marginTop: '20px' }}>
            <CardHeader title="Theming" />
            <List>
              <Divider />
              <ListItem>
                <ListItemText primary="Dark mode"/>
                <ListItemSecondaryAction>
                  <Switch
                    onChange={this._switchTheme}
                    checked={ state.user.theme === 'dark' }
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Card>
        </div>
      </div>
    );
  }
}

ProfileSettings.propTypes = {
  dispatch: PropTypes.func.isRequired,
  state: PropTypes.object.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  return { state };
};

export default connect(mapStateToProps)(ProfileSettings);
