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

import AccountsSettings from './settings/AccountsSettings';
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
    this.component = null;
    this.state = {
      open: false,
      page: props.history.location.pathname,
      component: null
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      open: false,
      page: nextProps.history.location.pathname
    });
  }

  modal(component) {
    this.component = component;
    this.setState({
      open: true
    });
  }

  render() {
    return [
      <div key="modal" className={'modalContent ' + (this.state.open ? 'open' : 'close')}>
        <Card>
          { this.component }
        </Card>
      </div>
      ,
      <div key="content" className="sideListContent">
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

                <Subheader>General</Subheader>
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

              </SelectableList>
            </div>
          </Card>
        </div>
        <div className="column">
          { this.state.page === '/settings/accounts/' ? <AccountsSettings onModal={(component) => component ? this.modal(component) : this.setState({open: false, component: null})} /> : ''}
          { this.state.page === '/settings/profile/' ? <ProfileSettings onModal={(component) => component ? this.modal(component) : this.setState({open: false, component: null})} /> : ''}
          { this.state.page === '/settings/currencies/' ? <TemplateSettings /> : ''}
          { this.state.page === '/settings/server/' ? <TemplateSettings /> : ''}
          { this.state.page === '/settings/administration/' ? <TemplateSettings /> : ''}
          { this.state.page === '/settings/about/' ? <TemplateSettings /> : ''}
        </div>
      </div>
    ];
  }
}


  // <ListItem
  //   primaryText="Favorite currencies"
  //   secondaryText="Select displayed currencies"
  //   leftIcon={<MoneyIcon />}
  //   rightIcon={<KeyboardArrowRight />}
  //   onClick={(event, index) => {
  //     this.setState({page: '/settings/currencies/'});
  //     this.history.push('/settings/currencies/');
  //   }}
  //   value='/settings/currencies/' />
  // <Subheader>Hosting</Subheader>
  // <ListItem
  //   primaryText="Server"
  //   secondaryText="Configure your hosting"
  //   leftIcon={<StorageIcon />}
  //   rightIcon={<KeyboardArrowRight />}
  //   onClick={(event, index) => {
  //     this.setState({page: '/settings/server/'});
  //     this.history.push('/settings/server/');
  //   }}
  //   value='/settings/server/' />
  // <ListItem
  //   primaryText="Administration"
  //   secondaryText="Access administration section"
  //   leftIcon={<PeopleIcon />}
  //   rightIcon={<KeyboardArrowRight />}
  //   onClick={(event, index) => {
  //     this.setState({page: '/settings/administration/'});
  //     this.history.push('/settings/administration/');
  //   }}
  //   value='/settings/administration/' />

  // <Subheader>Others</Subheader>
  // <ListItem
  //   primaryText="About Seven23"
  //   leftIcon={<InfoIcon />}
  //   rightIcon={<KeyboardArrowRight />}
  //   onClick={(event, index) => {
  //     this.setState({page: '/settings/about/'});
  //     this.history.push('/settings/about/');
  //   }}
  //   value='/settings/about/' />

export default muiThemeable()(Settings);
