/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, {Component} from 'react';

import muiThemeable from 'material-ui/styles/muiThemeable';
import {Route, Switch } from 'react-router-dom';

import PropTypes from 'prop-types';
import { Card, CardActions, CardText, CardTitle } from 'material-ui/Card';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn}
  from 'material-ui/Table';
import {blueGrey500, darkBlack, lightBlack} from 'material-ui/styles/colors';
import FlatButton from 'material-ui/FlatButton';
import {List, ListItem, makeSelectable} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import Public from 'material-ui/svg-icons/social/public';
import UndoIcon from 'material-ui/svg-icons/content/undo';
import {red500, grey400} from 'material-ui/styles/colors';
import ContentAdd from 'material-ui/svg-icons/content/add';
import InfoIcon from 'material-ui/svg-icons/action/info';
import AccountBoxIcon from 'material-ui/svg-icons/action/account-box';
import PeopleIcon from 'material-ui/svg-icons/social/people';
import MoneyIcon from 'material-ui/svg-icons/editor/attach-money';
import StorageIcon from 'material-ui/svg-icons/device/storage';
import AvLibraryBooks from 'material-ui/svg-icons/av/library-books';
import KeyboardArrowRight from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import Paper from 'material-ui/Paper';

import UserStore from '../../stores/UserStore';
import AccountForm from '../settings/accounts/AccountForm';
import AccountDeleteForm from '../settings/accounts/AccountDeleteForm';

import AccountStore from '../../stores/AccountStore';
import AccountActions from '../../actions/AccountActions';

let SelectableList = makeSelectable(List);

const styles = {
  column: {
    width: '50%',
    padding: '5px',
    boxSizing: 'border-box',
  },
};

const iconButtonElement = (
  <IconButton touch={true}>
    <MoreVertIcon color={grey400} />
  </IconButton>
);


class AccountsSettings extends Component {

  constructor(props, context) {
    super(props, context);
    this.onModal = props.onModal;
    this.state = {
      accounts: AccountStore.accounts
    };
  }

  _openAccount = (account = null) => {
    this.onModal(
      <AccountForm
        account={ account }
        onSubmit={() => this.onModal()}
        onClose={() => this.onModal()} />
    );
  };

  _deleteAccount = (account = null) => {
    this.onModal(
      <AccountDeleteForm
        account={ account }
        onSubmit={() => this.onModal()}
        onClose={() => this.onModal()} />
    );
  };

  // Listener on ChangeEvent
  _updateAccounts = (accounts) => {
    this.setState({
      accounts: accounts
    });
  };

  componentWillMount() {
    AccountStore.addChangeListener(this._updateAccounts);
  }

  componentWillUnmount() {
    AccountStore.removeChangeListener(this._updateAccounts);
  }

  componentWillReceiveProps(nextProps) {
    this.modal = nextProps.modal;
    this.setState({
      primaryColor: nextProps.muiTheme.palette.primary1Color
    });
  }

  rightIconMenu(account) {
    return (
      <IconMenu
        iconButtonElement={iconButtonElement}
        anchorOrigin={{horizontal: 'right', vertical: 'top'}}
        targetOrigin={{horizontal: 'right', vertical: 'top'}}>
        <MenuItem onTouchTap={() => this._openAccount(account) }>Edit</MenuItem>
        <MenuItem onTouchTap={() => this._deleteAccount(account) }>Delete</MenuItem>
      </IconMenu>
    );
  }

  render() {
    return (
      <div>
        <Card style={{maxWidth: '400px', marginTop: '10px'}}>
          <CardTitle title="Acounts" subtitle="You can manage multiple accounts with the same user." />
          <List>
            <Divider />
            {
              this.state.accounts.sort((a, b) => {
                return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
              }).map((account) => (
                <ListItem
                  key={account.id}
                  primaryText={account.name}
                  disabled={true}
                  secondaryText={
                    <p>
                      { account.isPublic ? <span>Is public, </span> : ''}
                      Private account
                    </p>
                  }
                  rightIconButton={this.rightIconMenu(account)}/>
              ))
            }
            <Divider />
            <ListItem
              primaryText='Create new account'
              secondaryText='You can create as many account as you want.'
              rightIcon={<KeyboardArrowRight />}
              onTouchTap={() => this._openAccount()}/>
          </List>
        </Card>
      </div>
    );
  }
}

export default muiThemeable()(AccountsSettings);
