import moment from 'moment';
import classnames from 'classnames';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Collapse from '@material-ui/core/Collapse';

import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import UserActions from '../../actions/UserActions';

const styles = theme => ({
  expand: {
    transform: 'rotate(0deg)',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
    marginLeft: 'auto',
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
});

class ServerSettings extends Component {
  constructor(props, context) {
    super(props, context);
    this.history = props.history;
    this.state = {
      expanded: false
    };
  }

  _handleExpandClick = () => {
    this.setState({
      expanded: !this.state.expanded
    });
  };

  _revokePassword = () => {
    const { dispatch } = this.props;

    dispatch(UserActions.revokeToken()).then(() => {
      this.history.replace('/logout');
    }).catch((error) => {
      console.error(error);
    });
  };

  render() {
    const { expanded } = this.state;
    const { classes, server, token } = this.props;
    return (
      <div className="grid">
        <div className="card small">
          <Card>
            <CardHeader title="Server" subtitle="Details about your hosting" />
            <List>
              <Divider />
              <ListItem>
                <ListItemText primary="Name" secondary={server.name} />
              </ListItem>
              <ListItem>
                <ListItemText primary="API Version" secondary={server['api_version'].join('.')} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Administrator email" secondary={server.contact || 'Not defined'} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Sign in" secondary={
                  server.allow_account_creation
                    ? 'Enable'
                    : 'Disable'
                } />
              </ListItem>
            </List>
          </Card>
          <Card style={{ marginTop: '20px' }}>
            <CardHeader
              title="Authentication"
              subtitle="Technicals informations for debugging"
              action={
                <IconButton
                  className={classnames(classes.expand, {
                    [classes.expandOpen]: expanded,
                  })}
                  onClick={this._handleExpandClick}
                  aria-expanded={expanded}
                  aria-label="Show more"
                >
                  <ExpandMoreIcon />
                </IconButton>
              }
            />
            <Collapse in={expanded} timeout="auto" unmountOnExit>
              <CardContent style={{ padding: '0px' }}>
                <List>
                  <Divider />
                  <ListItem>
                    <ListItemText primary="Authentication token" secondary={token} />
                  </ListItem>
                  <Divider />
                  <ListItem
                    button
                    onClick={this._revokePassword}
                  >
                    <ListItemIcon>
                      <DeleteForeverIcon />
                    </ListItemIcon>
                    <ListItemText primary="Revoke Token" secondary="Delete the token and logout" />
                  </ListItem>
                </List>
              </CardContent>
            </Collapse>
          </Card>
        </div>
        <div className="card large">
          <h2>Terms and conditions</h2>
          <p>
            Terms and condition are defined by the hosting platform, and can be
            different for every instance.
          </p>
          <Divider />

          {server.terms_and_conditions ? (
            <div>
              <h3>
                Publised on{' '}
                {moment(
                  server.terms_and_conditions_date,
                  'YYYY-MM-DD',
                ).format('MMMM Do,YYYY')}
              </h3>
              <div
                dangerouslySetInnerHTML={{
                  __html: server.terms_and_conditions,
                }}
              />
            </div>
          ) : (
            <p>This server has no terms and conditions defined.</p>
          )}
        </div>
      </div>
    );
  }
}

ServerSettings.propTypes = {
  classes: PropTypes.object.isRequired,
  server: PropTypes.object.isRequired,
  token: PropTypes.string.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  return {
    token: state.user.token,
    server: state.server
  };
};

export default connect(mapStateToProps)(withStyles(styles)(ServerSettings));
