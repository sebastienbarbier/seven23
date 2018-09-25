/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import './SyncButton.scss';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import LoopIcon from '@material-ui/icons/Loop';

import ServerActions from '../../actions/ServerActions';

class SyncButton extends Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      syncing: false
    };
  }

  sync = () => {
    const { dispatch } = this.props;

    dispatch(ServerActions.sync());
  };

  render() {
    const { syncing, disabled } = this.state;
    const { server } = this.props;

    return (
      <MenuItem disabled={server.isSyncing} onClick={() => { this.sync(); }}>
        <ListItemIcon className={server.isSyncing ? 'syncingAnimation' : 'syncingAnimation stop'}><LoopIcon /></ListItemIcon>
        <ListItemText>Sync</ListItemText>
      </MenuItem>

    );
  }
}

SyncButton.propTypes = {
  dispatch: PropTypes.func.isRequired,
  server: PropTypes.object.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  return {
    server: state.server
  };
};


export default connect(mapStateToProps)(SyncButton);;
