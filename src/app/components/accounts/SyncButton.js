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

// const styles = {
//   refreshIcon: {
//     marginRight: 14,
//     opacity: 0.54,
//   },
//   refreshButton: {
//     textTransform: 'none',
//     fontSize: '1rem',
//     fontWeight: 400,
//   }
// };

class SyncButton extends Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      syncing: false
    };
  }

  sync = () => {
    this.setState({
      syncing: !this.state.syncing
    });
  };

  render() {
    const { syncing } = this.state;
    return (
      <MenuItem onClick={() => { this.sync(); }}>
        <ListItemIcon className={syncing ? 'syncingAnimation' : 'syncingAnimation stop'}><LoopIcon /></ListItemIcon>
        <ListItemText>Sync</ListItemText>
      </MenuItem>

    );
  }
}

// <Button style={styles.refreshButton}>
//   <LoopIcon style={styles.refreshIcon} />
// </Button>

export default SyncButton;
