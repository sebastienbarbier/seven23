/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Card from '@material-ui/core/Card';
import Paper from '@material-ui/core/Paper';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';

import PaymentIcon from '@material-ui/icons/Payment';
import HelpIcon from '@material-ui/icons/HelpOutline';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import MoneyIcon from '@material-ui/icons/AttachMoney';
import StorageIcon from '@material-ui/icons/Storage';
import AvLibraryBooks from '@material-ui/icons/LibraryBooks';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';

import AccountsSettings from './settings/AccountsSettings';
import ProfileSettings from './settings/ProfileSettings';
import TemplateSettings from './settings/TemplateSettings';
import HelpSettings from './settings/HelpSettings';
import SubscriptionSettings from './settings/SubscriptionSettings';
import ServerSettings from './settings/ServerSettings';
import CurrenciesSettings from './settings/CurrenciesSettings';

class Settings extends Component {
  constructor(props, context) {
    super(props, context);
    this.history = props.history;
    this.component = null;
    this.state = {
      open: false,
      page: props.history.location.pathname,
      component: null,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      open: false,
      page: nextProps.history.location.pathname,
    });
  }

  modal(component) {
    this.component = component;
    this.setState({
      open: true,
    });
  }

  render() {

    const { server } = this.props;
    return [
      <div
        key="modal"
        className={'modalContent ' + (this.state.open ? 'open' : 'close')}
      >
        <Card>{this.component}</Card>
      </div>,
      <div key="content" className="sideListContent">
        <div
          className={
            this.state.page != '/settings' ? 'hideOnMobile column' : 'column'
          }
        >
          <Card className="card">
            <div className="cardContainer">
              <Paper>
                <header className="padding">
                  <h2 style={{ color: 'white' }}>Settings</h2>
                </header>
              </Paper>
              <List subheader={<ListSubheader disableSticky={true}>Your account</ListSubheader>}>
                <ListItem
                  button
                  onClick={(event, index) => {
                    this.setState({ page: '/settings/profile/' });
                    this.history.push('/settings/profile/');
                  }}
                  disabled={false}>
                  <ListItemIcon>
                    <AccountBoxIcon />
                  </ListItemIcon>
                  <ListItemText primary="User profile" secondary="Configure your data" />
                  <KeyboardArrowRight />
                </ListItem>
                <ListItem
                  button
                  onClick={(event, index) => {
                    this.setState({ page: '/settings/accounts/' });
                    this.history.push('/settings/accounts/');
                  }}
                  disabled={false}
                >
                  <ListItemIcon>
                    <AvLibraryBooks />
                  </ListItemIcon>
                  <ListItemText primary="Expenses accounts" secondary="Manage yours accounts" />
                  <KeyboardArrowRight />
                </ListItem>
                <ListItem
                  button
                  onClick={(event, index) => {
                    this.setState({ page: '/settings/currencies/' });
                    this.history.push('/settings/currencies/');
                  }}
                  disabled={false}
                >
                  <ListItemIcon>
                    <MoneyIcon />
                  </ListItemIcon>
                  <ListItemText primary="Favorites currencies" secondary="Select in app currency" />
                  <KeyboardArrowRight />
                </ListItem>
              </List>
              <List subheader={<ListSubheader disableSticky={true}>Hosting</ListSubheader>}>
                <ListItem
                  button
                  onClick={(event, index) => {
                    this.setState({ page: '/settings/server/' });
                    this.history.push('/settings/server/');
                  }}
                >
                  <ListItemIcon>
                    <StorageIcon />
                  </ListItemIcon>
                  <ListItemText primary="Server" secondary="Details about your hostingy" />
                  <KeyboardArrowRight />
                </ListItem>
                { server.saas ? (
                  <ListItem
                    button
                    onClick={(event, index) => {
                      this.setState({ page: '/settings/subscription/' });
                      this.history.push('/settings/subscription/');
                    }}
                  >
                    <ListItemIcon>
                      <PaymentIcon />
                    </ListItemIcon>
                    <ListItemText primary="Subscription" secondary="Invoices, payment, offers, etc." />
                    <KeyboardArrowRight />
                  </ListItem>
                ) : (
                  ''
                )}
              </List>

              <List subheader={<ListSubheader disableSticky={true}>More settings</ListSubheader>}>
                <ListItem
                  button
                  onClick={(event, index) => {
                    this.setState({ page: '/settings/help/' });
                    this.history.push('/settings/help/');
                  }}
                >
                  <ListItemIcon>
                    <HelpIcon />
                  </ListItemIcon>
                  <ListItemText primary="Help/Support" secondary="Bug report, faq, questions, or anything else." />
                  <KeyboardArrowRight />
                </ListItem>
              </List>
            </div>
          </Card>
        </div>
        <div className="column">
          {this.state.page != '/settings' ? (
            <List className="return">
              <ListItem
                button
                onClick={(event, index) => {
                  this.history.push('/settings');
                }}
              >
                <ListItemIcon>
                  <KeyboardArrowLeft />
                </ListItemIcon>
                <ListItemText primary="Back to settings" />
              </ListItem>
            </List>
          ) : (
            ''
          )}

          {this.state.page === '/settings/accounts/' ? (
            <AccountsSettings
              onModal={component =>
                component
                  ? this.modal(component)
                  : this.setState({ open: false, component: null })
              }
            />
          ) : (
            ''
          )}
          {this.state.page === '/settings/profile/' ? (
            <ProfileSettings
              onModal={component =>
                component
                  ? this.modal(component)
                  : this.setState({ open: false, component: null })
              }
              history={this.history}
            />
          ) : (
            ''
          )}
          {this.state.page === '/settings/currencies/' ? (
            <CurrenciesSettings />
          ) : (
            ''
          )}
          { server.saas &&
          this.state.page === '/settings/subscription/' ? (
              <SubscriptionSettings />
            ) : (
              ''
            )}
          {this.state.page === '/settings/help/' ? <HelpSettings /> : ''}
          {this.state.page === '/settings/server/' ? (
            <ServerSettings history={this.history} />
          ) : (
            ''
          )}
          {this.state.page === '/settings/administration/' ? (
            <TemplateSettings />
          ) : (
            ''
          )}
        </div>
      </div>,
    ];
  }
}

Settings.propTypes = {
  server: PropTypes.object.isRequired
};

const mapStateToProps = (state, ownProps) => {
  return { server: state.server };
};

export default connect(mapStateToProps)(Settings);
