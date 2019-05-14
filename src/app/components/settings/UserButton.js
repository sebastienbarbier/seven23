/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import md5 from 'blueimp-md5';
import { Link } from 'react-router-dom';

import Button from '@material-ui/core/Button';

import MenuItem from '@material-ui/core/MenuItem';
import List from '@material-ui/core/List';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItem from '@material-ui/core/ListItem';

import Avatar from '@material-ui/core/Avatar';
import ExpandMore from '@material-ui/icons/ExpandMore';

import Popover from '@material-ui/core/Popover';

import Divider from '@material-ui/core/Divider';

import SettingsIcon from '@material-ui/icons/Settings';
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';

import SyncButton from '../accounts/SyncButton';
import AccountSelector from '../accounts/AccountSelector';
import CurrencySelector from '../currency/CurrencySelector';

class UserButton extends Component {

  constructor(props, context) {
    super(props, context);
    this.history = props.history;
    this.state = {
      open: false,
      anchorEl: null,
      type: props.type,
      color: props.color,
    };
  }

  handleClick = (event = {}) => {
    const { currentTarget } = event;

    this.setState(state => ({
      anchorEl: currentTarget,
      open: !state.open,
    }));
  };

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  render() {
    const { profile, isSyncing, accounts, badge } = this.props;
    const { anchorEl, open, type, color } = this.state;

    const url = `https://www.gravatar.com/avatar/${md5(profile.email)}?d=mp`;
    const id = open ? 'user-popper' : null;

    return (
      <div className="wrapperMobile">
        { type === 'button' ? (
            <Button onClick={this.handleClick}>
              <div className={badge && !isSyncing ? 'badgeSync open' : 'badgeSync'}>
                  <Avatar src={url} style={{ height: 30, width: 30, marginTop: 1, background: 'rgba(0, 0, 0, 0.3)' }} />
              </div>
              <span className="hideMobile">{ profile.first_name || profile.username }</span>
              <ExpandMore color='action' style={{ color: color }} />
            </Button>
        ) : (
          <MenuItem style={{ height: '50px', paddingTop: 0, paddingBottom: 0 }} onClick={this.handleClick}>
            <ListItemAvatar>
              <Avatar src={url} style={{ height: 30, width: 30, marginTop: 1, background: 'rgba(0, 0, 0, 0.3)' }} />
            </ListItemAvatar>
            <ListItemText className="hideMobile">{ profile.first_name || profile.username }</ListItemText>
            <ListItemIcon><ExpandMore color='action' style={{ color: color }} /></ListItemIcon>
          </MenuItem>
        )}
        <Popover
          id={id}
          open={open}
          onClose={this.handleClick}
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}>
          { accounts && accounts.length >= 1 ? <SyncButton
            onClick={(event) => this.handleClick(event) }
            className='hideDesktop' /> : '' }
          { accounts && accounts.length >= 1 ? <Divider className='hideDesktop' /> : '' }
          { accounts && accounts.length > 1 ? <AccountSelector
            disabled={isSyncing}
            onChange={(event) => this.handleClick(event) }
            className='hideDesktop' /> : '' }
          { accounts && accounts.length >= 1 ? <CurrencySelector
            history={this.history}
            disabled={isSyncing}
            onChange={(event) => this.handleClick(event) }
            display='code'
            className='hideDesktop' /> : '' }
          <List style={{ padding: 0, margin: 0 }}>
            { accounts && accounts.length >= 1 ? <Divider className='hideDesktop' /> : '' }
            { accounts && accounts.length >= 1 ? <Link to='/settings' onClick={(event) => this.handleClick(event)}>
              <ListItem button>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary='Settings' />
              </ListItem>
            </Link> : '' }
            { accounts && accounts.length >= 1 ? <Divider /> : '' }
            <Link to='/logout' onClick={(event) => this.handleClick(event)}>
              <ListItem button>
                <ListItemIcon>
                  <PowerSettingsNewIcon />
                </ListItemIcon>
                <ListItemText primary='Logout' />
              </ListItem>
            </Link>
          </List>
        </Popover>
      </div>
    );
  }
}

UserButton.propTypes = {
  dispatch: PropTypes.func.isRequired,
  server: PropTypes.object.isRequired,
  isSyncing: PropTypes.bool.isRequired,
  profile: PropTypes.object.isRequired,
  accounts: PropTypes.array.isRequired,
  badge: PropTypes.number.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  return {
    server: state.server,
    profile: state.user.profile,
    isSyncing: state.state.isSyncing,
    isLoading: state.state.isLoading,
    accounts: state.user.accounts,
    badge: state.sync.counter || 0,
  };
};


export default connect(mapStateToProps)(UserButton);