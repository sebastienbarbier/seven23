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
    const { dispatch, onClick } = this.props;
    // Propagate onClick action to parent element
    if (onClick) { onClick(); }

    dispatch(ServerActions.sync());
  };

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  render() {
    const { last_sync, className, isSyncing } = this.props;

    return (
      <div className={className}>
        <Tooltip title={`Last sync ${moment(last_sync).fromNow()}`} enterDelay={450} placement="bottom">
          <MenuItem disabled={isSyncing} onClick={() => { this.sync(); }}>
            <ListItemIcon className={isSyncing ? 'syncingAnimation' : 'syncingAnimation stop'}><LoopIcon /></ListItemIcon>
            <ListItemText>Sync</ListItemText>
          </MenuItem>
        </Tooltip>
      </div>
    );
  }
}

SyncButton.propTypes = {
  dispatch: PropTypes.func.isRequired,
  last_sync: PropTypes.string,
  isSyncing: PropTypes.bool.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  return {
    isSyncing: state.state.isSyncing,
    last_sync: state.server.last_sync,
  };
};


export default connect(mapStateToProps)(SyncButton);;