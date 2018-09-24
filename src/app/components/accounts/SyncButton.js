/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import './SyncButton.scss';

import React, { Component } from 'react';

import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import LoopIcon from '@material-ui/icons/Loop';

class SyncButton extends Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      syncing: false
    };
  }

  sync = () => {
    this.setState({
      syncing: !this.state.syncing,
      disabled: !this.state.syncing ? true : false,
    });
    if (!this.state.syncing) {
      setTimeout(() => {
        this.setState({
          disabled: false,
        });
      }, 500);
    }
  };

  render() {
    const { syncing, disabled } = this.state;
    return (
      <MenuItem disabled={disabled} onClick={() => { this.sync(); }}>
        <ListItemIcon className={syncing ? 'syncingAnimation' : 'syncingAnimation stop'}><LoopIcon /></ListItemIcon>
        <ListItemText>Sync</ListItemText>
      </MenuItem>

    );
  }
}

export default SyncButton;
