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

import UserStore from '../stores/UserStore';
import AccountForm from './settings/AccountForm';
import ProfileForm from './settings/ProfileForm';
import PasswordForm from './settings/PasswordForm';
import AccountDeleteForm from './settings/AccountDeleteForm';
import AccountsSettings from './accounts/AccountsSettings';
import ProfileSettings from './settings/ProfileSettings';
import TemplateSettings from './settings/TemplateSettings';

import AccountStore from '../stores/AccountStore';
import AccountActions from '../actions/AccountActions';



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


class Settings extends Component {

  constructor(props, context) {
    super(props, context);
    this.history = props.history;
    this.state = {
      page: props.history.location.pathname
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      page: nextProps.history.location.pathname
    });
  }

  render() {
    return [
      <div className={'modalContent ' + (this.state.open ? 'open' : 'close')}>
        <Card>

        </Card>
      </div>
      ,
      <div className="sideListContent">
        <div className="column">

          <Card className="card">
            <div className="cardContainer">
              <Paper zDepth={1}>
                <header className="padding">
                  <h2>Settings</h2>
                </header>
              </Paper>

              <SelectableList
                value={this.state.page}>

                <Subheader>Datas</Subheader>
                <ListItem
                  primaryText="Expenses accounts"
                  secondaryText="Manage yours accounts"
                  leftIcon={<AvLibraryBooks />}
                  rightIcon={<KeyboardArrowRight />}
                  onClick={(event, index) => {
                    this.setState({page: '/settings/accounts/'});
                    this.history.push('/settings/accounts/');
                  }}
                  value='/settings/accounts/'
                  disabled={false}/>
                <ListItem
                  primaryText="Favorite currencies"
                  secondaryText="Select displayed currencies"
                  leftIcon={<MoneyIcon />}
                  rightIcon={<KeyboardArrowRight />}
                  onClick={(event, index) => {
                    this.setState({page: '/settings/currencies/'});
                    this.history.push('/settings/currencies/');
                  }}
                  value='/settings/currencies/' />
                <ListItem
                  primaryText="User profile"
                  secondaryText="Configure your personnal data"
                  leftIcon={<AccountBoxIcon />}
                  rightIcon={<KeyboardArrowRight />}
                  onClick={(event, index) => {
                    this.setState({page: '/settings/profile/'});
                    this.history.push('/settings/profile/');
                  }}
                  value='/settings/profile/'
                  disabled={false}/>
                <Subheader>Hosting</Subheader>
                <ListItem
                  primaryText="Server"
                  secondaryText="Configure your hosting"
                  leftIcon={<StorageIcon />}
                  rightIcon={<KeyboardArrowRight />}
                  onClick={(event, index) => {
                    this.setState({page: '/settings/server/'});
                    this.history.push('/settings/server/');
                  }}
                  value='/settings/server/' />
                <ListItem
                  primaryText="Administration"
                  secondaryText="Access administration section"
                  leftIcon={<PeopleIcon />}
                  rightIcon={<KeyboardArrowRight />}
                  onClick={(event, index) => {
                    this.setState({page: '/settings/administration/'});
                    this.history.push('/settings/administration/');
                  }}
                  value='/settings/administration/' />

                <Subheader>Others</Subheader>
                <ListItem
                  primaryText="About Seven23"
                  leftIcon={<InfoIcon />}
                  rightIcon={<KeyboardArrowRight />}
                  onClick={(event, index) => {
                    this.setState({page: '/settings/about/'});
                    this.history.push('/settings/about/');
                  }}
                  value='/settings/about/' />

              </SelectableList>
            </div>
          </Card>
        </div>
        <div className="column">
          <Switch>
            <Route path="/settings/accounts/" component={AccountsSettings} />
            <Route path="/settings/profile/" component={ProfileSettings} />
            <Route path="/settings/currencies/" component={TemplateSettings} />
            <Route path="/settings/server/" component={TemplateSettings} />
            <Route path="/settings/administration/" component={TemplateSettings} />
            <Route path="/settings/about/" component={TemplateSettings} />
          </Switch>
        </div>
      </div>
    ];
  }
}

export default muiThemeable()(Settings);
