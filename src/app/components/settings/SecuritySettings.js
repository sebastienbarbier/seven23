import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

const styles = theme => ({
  expand: {
    transform: 'rotate(0deg)',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
    marginLeft: 'auto',
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
});

class SecuritySettings extends Component {
  constructor(props, context) {
    super(props, context);
    this.history = props.history;
  }

  render() {
    const { cipher } = this.props;
    return (
      <List className="wrapperMobile">
        <ListItem>
          <ListItemText primary="Encryption key" secondary={cipher} />
        </ListItem>
      </List>
    );
  }
}

SecuritySettings.propTypes = {
  classes: PropTypes.object.isRequired,
  cipher: PropTypes.string.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  return {
    cipher:  state.user.cipher,
  };
};

export default connect(mapStateToProps)(withStyles(styles)(SecuritySettings));