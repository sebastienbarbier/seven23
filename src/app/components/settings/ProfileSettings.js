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

import UserActions from '../../actions/UserActions';
import PasswordForm from '../settings/profile/PasswordForm';
import EmailForm from '../settings/profile/EmailForm';

class ProfileSettings extends Component {
  constructor(props, context) {
    super(props, context);
    this.onModal = props.onModal;
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
    const { dispatch, theme } = this.props;
    dispatch(UserActions.setTheme(theme === 'dark' ? 'light' : 'dark'));
  };

  render() {
    const { profile, theme } = this.props;
    return (
      <div className="grid">
        <div className="small">
          <Card square>
            <CardHeader title="Profile" subtitle="Edit your user profile" />
            <List>
              <Divider />
              <ListItem>
                <ListItemText primary="Username" secondary={profile.username}/>
              </ListItem>
              <ListItem
                button
                onClick={this._editMail}
              >
                <ListItemText primary="Email" secondary={profile.email}/>
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
          <Card square style={{ marginTop: '20px' }}>
            <CardHeader title="Theming" />
            <List>
              <Divider />
              <ListItem>
                <ListItemText primary="Dark mode"/>
                <ListItemSecondaryAction>
                  <Switch
                    onChange={this._switchTheme}
                    checked={ theme === 'dark' }
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
  profile: PropTypes.object.isRequired,
  theme: PropTypes.string.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  return {
    profile: state.user.profile,
    theme: state.user.theme
  };
};

export default connect(mapStateToProps)(ProfileSettings);