/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from "react";

import muiThemeable from "material-ui/styles/muiThemeable";
import { Route, Switch } from "react-router-dom";

import PropTypes from "prop-types";
import { Card, CardActions, CardText, CardTitle } from "material-ui/Card";
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn
} from "material-ui/Table";
import { blueGrey500, darkBlack, lightBlack } from "material-ui/styles/colors";
import FlatButton from "material-ui/FlatButton";
import { List, ListItem, makeSelectable } from "material-ui/List";
import Subheader from "material-ui/Subheader";
import IconMenu from "material-ui/IconMenu";
import MenuItem from "material-ui/MenuItem";
import Divider from "material-ui/Divider";
import IconButton from "material-ui/IconButton";
import MoreVertIcon from "material-ui/svg-icons/navigation/more-vert";
import Public from "material-ui/svg-icons/social/public";
import UndoIcon from "material-ui/svg-icons/content/undo";
import { red500, grey400 } from "material-ui/styles/colors";
import ContentAdd from "material-ui/svg-icons/content/add";
import InfoIcon from "material-ui/svg-icons/action/info";
import AccountBoxIcon from "material-ui/svg-icons/action/account-box";
import PeopleIcon from "material-ui/svg-icons/social/people";
import SecurityIcon from "material-ui/svg-icons/hardware/security";
import StorageIcon from "material-ui/svg-icons/device/storage";
import EditIcon from "material-ui/svg-icons/image/edit";
import KeyboardArrowRight from "material-ui/svg-icons/hardware/keyboard-arrow-right";
import Paper from "material-ui/Paper";

import UserStore from "../../stores/UserStore";
import UserActions from "../../actions/UserActions";
import PasswordForm from "../settings/profile/PasswordForm";
import EmailForm from "../settings/profile/EmailForm";

import AccountStore from "../../stores/AccountStore";
import AccountActions from "../../actions/AccountActions";

let SelectableList = makeSelectable(List);

const styles = {};

const iconButtonElement = (
  <IconButton touch={true}>
    <MoreVertIcon color={grey400} />
  </IconButton>
);

class ProfileSettings extends Component {
  constructor(props, context) {
    super(props, context);
    this.onModal = props.onModal;
    this.history = props.history;
    this.state = {
      profile: UserStore.user,
      token: localStorage.getItem("token")
    };
  }

  _editPassword = () => {
    this.onModal(
      <PasswordForm
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

  _changeSelectedAccount = account => {
    localStorage.setItem("account", account.id);
    AccountStore.emitChange();
  };

  // Listener on profile change
  _updateProfile = profile => {
    if (profile && profile.username) {
      this.setState({
        profile: profile
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
      primaryColor: nextProps.muiTheme.palette.primary1Color
    });
  }

  rightIconMenu(account) {
    return (
      <IconMenu
        iconButtonElement={iconButtonElement}
        anchorOrigin={{ horizontal: "right", vertical: "top" }}
        targetOrigin={{ horizontal: "right", vertical: "top" }}
      >
        <MenuItem
          onTouchTap={() => {
            this._openAccount(account);
          }}
        >
          Edit
        </MenuItem>
        <MenuItem onTouchTap={() => this._deleteAccount(account)}>
          Delete
        </MenuItem>
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
                onTouchTap={this._editMail}
                rightIcon={<KeyboardArrowRight />}
                secondaryText={this.state.profile.email}
              />
              <Divider />
              <ListItem
                primaryText="Change password"
                onTouchTap={this._editPassword}
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
