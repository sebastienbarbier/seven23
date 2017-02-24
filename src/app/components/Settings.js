/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, {Component} from 'react';
import { Card, CardActions, CardText } from 'material-ui/Card';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn}
  from 'material-ui/Table';
import {blueGrey500} from 'material-ui/styles/colors';
import FlatButton from 'material-ui/FlatButton';

import UserStore from '../stores/UserStore';
import ProfileForm from './settings/ProfileForm';
import PasswordForm from './settings/PasswordForm';
import DeleteForm from './settings/DeleteForm';


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
};

class Settings extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      profile: UserStore.user,
      openProfile: false,
      openPassword: false,
      openDelete: false,
    };
  }

  _editProfile = () => {
    this.setState({
      openProfile: true,
      openPassword: false,
      openDelete: false,
    });
  };

  _editPassword = () => {
    this.setState({
      openProfile: false,
      openPassword: true,
      openDelete: false,
    });
  };

  _delete = () => {
    this.setState({
      openProfile: false,
      openPassword: false,
      openDelete: true,
    });
  };

  _updateProfile = (profile) => {
    // If delete user, profile is null.
    if (profile) {
      let user = this.state.profile;
      user.email = profile.email;

      this.setState({
        profile: user,
      });
    }
  };

  componentWillMount() {
    UserStore.addChangeListener(this._updateProfile);
  }

  componentDidMount() {
  }

  componentWillUnmount() {
    UserStore.removeChangeListener(this._updateProfile);
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
            <CardText>
              <p>Thanks for using 723e</p>
            </CardText>
          </Card>
        </div>
      </div>
      <PasswordForm profile={this.state.profile} open={this.state.openPassword}></PasswordForm>
    </div>
    );
  }
}

/*
	Ideas :
      <p>Security : Activate two-factor authentication</p>
      <p>Invoice, Affiliated</p>
      <p>Enable/Disable location</p>
      <p>Shared access</p>

              <FlatButton
                label="Edit profile"
                onTouchTap={this._editProfile}
              />

              <FlatButton
                label="Delete account"
                onTouchTap={this._delete}
              />
      <ProfileForm profile={this.state.profile} open={this.state.openProfile}></ProfileForm>

      <DeleteForm profile={this.state.profile} open={this.state.openDelete}></DeleteForm>
 */

export default Settings;
