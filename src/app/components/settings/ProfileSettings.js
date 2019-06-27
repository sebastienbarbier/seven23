/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

import Divider from "@material-ui/core/Divider";

import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight";

import PasswordForm from "../settings/profile/PasswordForm";
import EmailForm from "../settings/profile/EmailForm";
import FirstNameForm from "../settings/profile/FirstNameForm";
import UserNameForm from "../settings/profile/UserNameForm";
import AvatarForm from "../settings/profile/AvatarForm";

class ProfileSettings extends Component {
  constructor(props, context) {
    super(props, context);
    this.onModal = props.onModal;
  }

  _editUserName = () => {
    this.onModal(
      <UserNameForm
        onSubmit={() => this.onModal()}
        onClose={() => this.onModal()}
      />
    );
  };

  _editPassword = () => {
    this.onModal(
      <PasswordForm
        onSubmit={() => this.onModal()}
        onClose={() => this.onModal()}
      />
    );
  };

  _editFirstName = () => {
    this.onModal(
      <FirstNameForm
        onSubmit={() => this.onModal()}
        onClose={() => this.onModal()}
      />
    );
  };

  _editMail = () => {
    this.onModal(
      <EmailForm
        onSubmit={() => this.onModal()}
        onClose={() => this.onModal()}
      />
    );
  };

  _editAvatar = () => {
    this.onModal(
      <AvatarForm
        onSubmit={() => this.onModal()}
        onClose={() => this.onModal()}
      />
    );
  };

  render() {
    const { profile } = this.props;
    return (
      <List className="wrapperMobile">
        <ListItem button onClick={this._editUserName}>
          <ListItemText primary="Username" secondary={profile.username} />
          <KeyboardArrowRight />
        </ListItem>
        <ListItem button onClick={this._editFirstName}>
          <ListItemText primary="Firstname" secondary={profile.first_name} />
          <KeyboardArrowRight />
        </ListItem>
        <ListItem button onClick={this._editMail}>
          <ListItemText primary="Email" secondary={profile.email} />
          <KeyboardArrowRight />
        </ListItem>
        <ListItem button onClick={this._editAvatar}>
          <ListItemText
            primary="Avatar"
            secondary={
              profile.profile && profile.profile.avatar == "GRAVATAR"
                ? "Gravatar"
                : "None"
            }
          />
          <KeyboardArrowRight />
        </ListItem>
        <Divider />
        <ListItem button onClick={this._editPassword}>
          <ListItemText
            primary="Change password"
            secondary="Do not neglect security"
          />
          <KeyboardArrowRight />
        </ListItem>
      </List>
    );
  }
}

ProfileSettings.propTypes = {
  dispatch: PropTypes.func.isRequired,
  profile: PropTypes.object.isRequired
};

const mapStateToProps = (state, ownProps) => {
  return {
    profile: state.user.profile
  };
};

export default connect(mapStateToProps)(ProfileSettings);
