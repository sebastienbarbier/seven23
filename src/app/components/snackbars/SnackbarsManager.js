/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Snackbar from '@material-ui/core/Snackbar';
import Button from '@material-ui/core/Button';

class SnackbarsManager extends Component {

  constructor(props, context) {
    super(props, context);
    this.history = props.history;
    this.state = {
      snackbar: null,
      open: false,
    };
  }

  componentWillReceiveProps(newProps) {

    if (this.props.snackbars.length != newProps.snackbars.length && !this.state.open) {
      this.setState({
        snackbar: newProps.snackbars.pop(),
        open: true
      });
    }
  }

  handleSnackbarRequestClose = () => {
    this.setState({
      open: false
    });
  };

  handleUndoButton = () => {
    const { snackbar } = this.state;
    if (snackbar && snackbar.onClick) {
      snackbar.onClick();
    }
    this.setState({
      open: false
    });
  };

  render() {
    const {  } = this.props;
    const { open, snackbar } = this.state;

    return (
      <Snackbar
        style={{ position: 'absolute' }}
        open={open}
        message={snackbar ? snackbar.message : ''}
        autoHideDuration={3000}
        onClose={this.handleSnackbarRequestClose}
        action={
          snackbar && snackbar.onClick ? <Button color="inherit" size="small" onClick={this.handleUndoButton}>
            Undo
          </Button> : ''
        }
      />
    );
  }
}

SnackbarsManager.propTypes = {
  dispatch: PropTypes.func.isRequired,
  snackbars: PropTypes.array.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  return {
    snackbars: state.state.snackbars,
  };
};


export default connect(mapStateToProps)(SnackbarsManager);