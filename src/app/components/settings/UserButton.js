/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import md5 from 'blueimp-md5';
import { Link } from 'react-router-dom';

import MenuItem from '@material-ui/core/MenuItem';
import List from '@material-ui/core/List';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItem from '@material-ui/core/ListItem';

import Avatar from '@material-ui/core/Avatar';
import ExpandMore from '@material-ui/icons/ExpandMore';

import Fade from '@material-ui/core/Fade';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';

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
    };
  }

  handleClick = (event) => {
    const { currentTarget } = event;

    this.setState(state => ({
      anchorEl: currentTarget,
      open: !state.open,
    }));

    if (!this.state.open) {
      // Dirty, but works
      let that = this;
      setTimeout(() => {
        window.addEventListener('click', that.listennerToClickEvent , { once: true });
      }, 400);
    }
  };

  listennerToClickEvent = () => {
    if (this.skipClickEvent) {
      this.skipClickEvent = false;
      setTimeout(() => {
        window.addEventListener('click', this.listennerToClickEvent , { once: true });
      }, 400);
    } else {
      this.setState(state => ({ open: false }));
    }
  };

  disableOnceHandleClick = (event) => {
    this.skipClickEvent = true;
  };

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  render() {
    const { profile, isSyncing } = this.props;
    const { anchorEl, open } = this.state;

    const url = `https://www.gravatar.com/avatar/${md5(profile.email)}?d=mp`;
    const id = open ? 'user-popper' : null;

    return (
      <div>
        <MenuItem style={{ height: '50px', paddingTop: 0, paddingBottom: 0 }} onClick={this.handleClick}>
          <ListItemAvatar><Avatar src={url} style={{ height: 30, width: 30, marginTop: 1, background: 'grey' }} /></ListItemAvatar>
          <ListItemText className="hideMobile">{ profile.first_name || profile.username }</ListItemText>
          <ListItemIcon><ExpandMore color='action' /></ListItemIcon>
        </MenuItem>
        <Popper id={id} open={open} anchorEl={anchorEl} placement='bottom-end' transition>
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={350}>
              <Paper>
                <SyncButton
                  className='hideDesktop' />
                <Divider className='hideDesktop' />
                <AccountSelector
                  disabled={isSyncing}
                  className='hideDesktop'
                  onClick={this.disableOnceHandleClick} />
                <CurrencySelector
                  history={this.history}
                  disabled={isSyncing}
                  display='code'
                  className='hideDesktop'
                  onClick={this.disableOnceHandleClick} />
                <List style={{ padding: 0, margin: 0 }}>
                  <Divider className='hideDesktop' />
                  <Link to='/settings'>
                    <ListItem button>
                      <ListItemIcon>
                        <SettingsIcon />
                      </ListItemIcon>
                      <ListItemText primary='Settings' />
                    </ListItem>
                  </Link>
                  <Divider />
                  <Link to='/logout'>
                    <ListItem button>
                      <ListItemIcon>
                        <PowerSettingsNewIcon />
                      </ListItemIcon>
                      <ListItemText primary='Logout' />
                    </ListItem>
                  </Link>
                </List>
              </Paper>
            </Fade>
          )}
        </Popper>
      </div>
    );
  }
}

UserButton.propTypes = {
  dispatch: PropTypes.func.isRequired,
  server: PropTypes.object.isRequired,
  isSyncing: PropTypes.bool.isRequired,
  profile: PropTypes.object.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  return {
    server: state.server,
    profile: state.user.profile,
    isSyncing: state.server.isSyncing,
  };
};


export default connect(mapStateToProps)(UserButton);