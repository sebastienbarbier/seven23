/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';

import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import Divider from '@material-ui/core/Divider';

import MoreVertIcon from '@material-ui/icons/MoreVert';
import ContentAdd from '@material-ui/icons/Add';

import AccountForm from '../settings/accounts/AccountForm';
import AccountDeleteForm from '../settings/accounts/AccountDeleteForm';

class AccountsSettings extends Component {
  constructor(props, context) {
    super(props, context);
    this.onModal = props.onModal;
    this.state = {
      anchorEl: null,
      selectedAccount: null,
    };
  }

  _openAccount = (account = null) => {
    this.onModal(
      <AccountForm
        account={account}
        onSubmit={() => this.onModal()}
        onClose={() => this.onModal()}
      />,
    );
  };

  _deleteAccount = (account = null) => {
    this.onModal(
      <AccountDeleteForm
        account={account}
        onSubmit={() => {
          if (this.props.accounts.length === 0) {
            this.props.history.push('/welcome');
          } else {
            this.onModal();
          }
        }}
        onClose={() => this.onModal()}
      />,
    );
  };

  _openActionMenu = (event, account) => {
    this.setState({
      anchorEl: event.currentTarget,
      selectedAccount: account
    });
  };

  _closeActionMenu = () => {
    this.setState({
      anchorEl: null,
      selectedAccount: null
    });
  };

  componentWillReceiveProps(nextProps) {
    this.modal = nextProps.modal;
  }

  render() {
    const { anchorEl } = this.state;
    const { accounts } = this.props;
    return (
      <div className="grid">
        <div className="small">
          <Card>
            <CardHeader
              title="Accounts"
              subheader="Create as many accounts as you want."
            />
            <List>
              <Divider />
              {accounts
                .sort((a, b) => {
                  if (a.name.toLowerCase() < b.name.toLowerCase()) {
                    return -1;
                  } else if (a.name.toLowerCase() > b.name.toLowerCase()) {
                    return 1;
                  } else if (a.id < b.id) {
                    return -1;
                  } else {
                    return 1;
                  }
                })
                .map(account => (
                  <ListItem
                    key={account.id}
                  >
                    <ListItemText primary={account.name} secondary="Private account" />
                    <ListItemSecondaryAction>
                      <IconButton
                        onClick={(event) => this._openActionMenu(event, account)}>
                        <MoreVertIcon  />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              <Divider />
              <ListItem
                button
                onClick={() => this._openAccount()}
              >
                <ListItemIcon>
                  <ContentAdd />
                </ListItemIcon>
                <ListItemText primary="Create new account" secondary="You can create as many account as you want." />
              </ListItem>
            </List>
          </Card>

          <Menu
            anchorEl={ anchorEl }
            open={ Boolean(anchorEl) }
            onClose={this._closeActionMenu}
          >
            <MenuItem
              onClick={() => {
                this._closeActionMenu();
                this._openAccount(this.state.selectedAccount);
              }}
            >
              Edit
            </MenuItem>
            <MenuItem
              onClick={() => {
                this._closeActionMenu();
                this._deleteAccount(this.state.selectedAccount);
              }}
            >
              Delete
            </MenuItem>
          </Menu>
        </div>
      </div>
    );
  }
}

AccountsSettings.propTypes = {
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  accounts: PropTypes.array.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  return {
    accounts: state.user.accounts,
  };
};

export default withRouter(connect(mapStateToProps)(AccountsSettings));
