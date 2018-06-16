import React, { Component } from 'react';
import moment from 'moment';
import muiThemeable from 'material-ui/styles/muiThemeable';
import { List, ListItem } from 'material-ui/List';
import Divider from 'material-ui/Divider';
import DeleteForeverIcon from 'material-ui/svg-icons/action/delete-forever';

import ServerStore from '../../stores/ServerStore';
import UserActions from '../../actions/UserActions';
import UserStore from '../../stores/UserStore';

import { Card, CardText, CardTitle } from 'material-ui/Card';

class ServerSettings extends Component {
  constructor(props, context) {
    super(props, context);
    this.history = props.history;
    this.state = {
      server: ServerStore.server,
      token: localStorage.getItem('token'),
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      server: ServerStore.server,
    });
  }

  _revokePassword = () => {
    UserStore.onceChangeListener(res => {
      if (!res) {
        this.history.replace('/logout');
      }
    });
    UserActions.revokeToken();
  };

  render() {
    return [
      <div className="grid">
        <div className="card small">
          <Card>
            <CardTitle title="Server" subtitle="Details about your hosting" />
            <List>
              <Divider />
              <ListItem
                primaryText="Name"
                disabled={true}
                secondaryText={this.state.server.name}
              />
              <ListItem
                primaryText="API Version"
                disabled={true}
                secondaryText={this.state.server['api_version'].join('.')}
              />
              <ListItem
                primaryText="Administrator email"
                disabled={true}
                secondaryText={this.state.server.contact || 'Not defined'}
              />
              <ListItem
                primaryText="Sign in"
                disabled={true}
                secondaryText={
                  this.state.server.allow_account_creation
                    ? 'Enable'
                    : 'Disable'
                }
              />
            </List>
          </Card>
          <Card style={{ marginTop: '20px' }}>
            <CardTitle
              title="Authentication"
              subtitle="Technicals informations for debugging"
              actAsExpander={true}
              showExpandableButton={true}
            />
            <CardText expandable={true} style={{ padding: '0px' }}>
              <List>
                <Divider />
                <ListItem
                  primaryText="Authentication token"
                  disabled={true}
                  secondaryText={this.state.token}
                />
                <Divider />
                <ListItem
                  primaryText="Revoke Token"
                  onClick={this._revokePassword}
                  leftIcon={<DeleteForeverIcon />}
                  secondaryText="Delete the token and logout"
                />
              </List>
            </CardText>
          </Card>
        </div>
        <div className="card large">
          <h2>Terms and conditions</h2>
          <p>
            Terms and condition are defined by the hosting platform, and can be
            different for every instance.
          </p>
          <Divider />

          {this.state.server.terms_and_conditions ? (
            <div>
              <h3>
                Publised on{' '}
                {moment(
                  this.state.server.terms_and_conditions_date,
                  'YYYY-MM-DD',
                ).format('MMMM Do,YYYY')}
              </h3>
              <div
                dangerouslySetInnerHTML={{
                  __html: this.state.server.terms_and_conditions,
                }}
              />
            </div>
          ) : (
            <p>This server has no terms and conditions defined.</p>
          )}
        </div>
      </div>,
    ];
  }
}

export default muiThemeable()(ServerSettings);
