/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import './SyncButton.scss';
import moment from 'moment';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import LoopIcon from '@material-ui/icons/Loop';
import Tooltip from '@material-ui/core/Tooltip';

import ServerActions from '../../actions/ServerActions';

class SyncButton extends Component {

  constructor(props, context) {
    super(props, context);

    this.state = {};
  }

  sync = () => {
    const { dispatch } = this.props;
    dispatch(ServerActions.sync());
  };

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  render() {
    const { last_sync, server } = this.props;

    return (
      <Tooltip title={`Last sync ${moment(last_sync).fromNow()}`} placement="bottom">
        <MenuItem disabled={server.isSyncing} onClick={() => { this.sync(); }}>
          <ListItemIcon className={server.isSyncing ? 'syncingAnimation' : 'syncingAnimation stop'}><LoopIcon /></ListItemIcon>
          <ListItemText>Sync</ListItemText>
        </MenuItem>
      </Tooltip>
    );
  }
}

SyncButton.propTypes = {
  dispatch: PropTypes.func.isRequired,
  server: PropTypes.object.isRequired,
  last_sync: PropTypes.string.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  return {
    server: state.server,
    last_sync: state.server.last_sync,
  };
};


export default connect(mapStateToProps)(SyncButton);;
