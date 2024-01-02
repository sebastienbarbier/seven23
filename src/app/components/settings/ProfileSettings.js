/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import { useDispatch, useSelector } from "react-redux";

import AppActions from "../../actions/AppActions";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

import Divider from "@mui/material/Divider";

import DeleteForever from "@mui/icons-material/DeleteForever";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";

import AvatarForm from "../settings/profile/AvatarForm";
import DeleteUserForm from "../settings/profile/DeleteUserForm";
import EmailForm from "../settings/profile/EmailForm";
import FirstNameForm from "../settings/profile/FirstNameForm";
import PasswordForm from "../settings/profile/PasswordForm";
import UserNameForm from "../settings/profile/UserNameForm";

export default function ProfileSettings(props) {
  const profile = useSelector((state) => state.user.profile);
  const dispatch = useDispatch();

  const _editUserName = () => {
    dispatch(
      AppActions.openModal(
        <UserNameForm
          onSubmit={() => dispatch(AppActions.closeModal())}
          onClose={() => dispatch(AppActions.closeModal())}
        />
      )
    );
  };

  const _editPassword = () => {
    dispatch(
      AppActions.openModal(
        <PasswordForm
          onSubmit={() => dispatch(AppActions.closeModal())}
          onClose={() => dispatch(AppActions.closeModal())}
        />
      )
    );
  };

  const _editFirstName = () => {
    dispatch(
      AppActions.openModal(
        <FirstNameForm
          onSubmit={() => dispatch(AppActions.closeModal())}
          onClose={() => dispatch(AppActions.closeModal())}
        />
      )
    );
  };

  const _editMail = () => {
    dispatch(
      AppActions.openModal(
        <EmailForm
          onSubmit={() => dispatch(AppActions.closeModal())}
          onClose={() => dispatch(AppActions.closeModal())}
        />
      )
    );
  };

  const _editAvatar = () => {
    dispatch(
      AppActions.openModal(
        <AvatarForm
          avatar={profile.profile.avatar}
          onSubmit={() => dispatch(AppActions.closeModal())}
          onClose={() => dispatch(AppActions.closeModal())}
        />
      )
    );
  };

  const _deleteUser = () => {
    dispatch(
      AppActions.openModal(
        <DeleteUserForm
          onSubmit={() => dispatch(AppActions.closeModal())}
          onClose={() => dispatch(AppActions.closeModal())}
        />
      )
    );
  };

  const avatars = {
    NONE: "None",
    GRAVATAR: "Gravatar",
    NOMADLIST: "Nomadlist",
  };

  return (
    <>
      {profile && (
        <List className="wrapperMobile">
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
      )}
    </>
  );
}
