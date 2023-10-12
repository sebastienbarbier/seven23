/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

import Divider from "@mui/material/Divider";

import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import DeleteForever from "@mui/icons-material/DeleteForever";

import PasswordForm from "../settings/profile/PasswordForm";
import EmailForm from "../settings/profile/EmailForm";
import FirstNameForm from "../settings/profile/FirstNameForm";
import UserNameForm from "../settings/profile/UserNameForm";
import AvatarForm from "../settings/profile/AvatarForm";
import DeleteUserForm from "../settings/profile/DeleteUserForm";

export default function ProfileSettings(props) {
  const profile = useSelector((state) => state.user.profile);

  const _editUserName = () => {
    props.onModal(
      <UserNameForm
        onSubmit={() => props.onModal()}
        onClose={() => props.onModal()}
      />
    );
  };

  const _editPassword = () => {
    props.onModal(
      <PasswordForm
        onSubmit={() => props.onModal()}
        onClose={() => props.onModal()}
      />
    );
  };

  const _editFirstName = () => {
    props.onModal(
      <FirstNameForm
        onSubmit={() => props.onModal()}
        onClose={() => props.onModal()}
      />
    );
  };

  const _editMail = () => {
    props.onModal(
      <EmailForm
        onSubmit={() => props.onModal()}
        onClose={() => props.onModal()}
      />
    );
  };

  const _editAvatar = () => {
    props.onModal(
      <AvatarForm
        avatar={profile.profile.avatar}
        onSubmit={() => props.onModal()}
        onClose={() => props.onModal()}
      />
    );
  };

  const _deleteUser = () => {
    props.onModal(
      <DeleteUserForm
        onSubmit={() => props.onModal()}
        onClose={() => props.onModal()}
      />
    );
  };

  const avatars = {
    NONE: "None",
    GRAVATAR: "Gravatar",
    NOMADLIST: "Nomadlist",
  };

  return (
    <List className="wrapperMobile mobile_footer_padding">
      <ListItem button onClick={_editUserName}>
        <ListItemText primary="Username" secondary={profile.username} />
        <KeyboardArrowRight />
      </ListItem>
      <ListItem button onClick={_editFirstName}>
        <ListItemText primary="Firstname" secondary={profile.first_name} />
        <KeyboardArrowRight />
      </ListItem>
      <ListItem button onClick={_editMail}>
        <ListItemText primary="Email" secondary={profile.email} />
        <KeyboardArrowRight />
      </ListItem>
      <ListItem button onClick={_editAvatar}>
        <ListItemText
          primary="Avatar"
          secondary={
            profile.profile && profile.profile.avatar
              ? avatars[profile.profile.avatar]
              : "None"
          }
        />
        <KeyboardArrowRight />
      </ListItem>
      <Divider />
      <ListItem button onClick={_editPassword}>
        <ListItemText
          primary="Change password"
          secondary="Do not neglect security"
        />
        <KeyboardArrowRight />
      </ListItem>
      <ListItem button onClick={_deleteUser}>
        <ListItemText
          primary="Delete my user account"
          secondary="Permanently delete all data from this server"
          primaryTypographyProps={{ color: "error" }}
        />
        <DeleteForever color="error" />
      </ListItem>
    </List>
  );
}