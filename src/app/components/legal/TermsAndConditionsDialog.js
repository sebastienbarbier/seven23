/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from 'react';
import moment from 'moment';

import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import ServerStore from '../../stores/ServerStore';


class TermsAndConditionsDialog extends Component {
  constructor(props, context) {
    super(props, context);
    // Set default values
    this.state = {
      open: false,
    };
  }

  handleClose = () => {
    this.setState({
      open: false,
    });
  };

  componentWillMount() {
    this.setState({
      server: ServerStore.server,
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      open: nextProps.open,
    });
  }

  render() {
    return (
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          modal={false}
          autoScrollBodyContent={true}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Terms and conditions</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
            <p>
              Terms and condition are defined by the hosting platform, and can be
              different for every instance.
            </p>
            <Divider />
            <p>
              Published on{' '}
              {moment(
                this.state.server.terms_and_conditions_date,
                'YYYY-MM-DD',
              ).format('MMMM Do,YYYY')}
            </p>
            <div
              dangerouslySetInnerHTML={{
                __html: this.state.server.terms_and_conditions,
              }}
            />
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button color="primary" onClick={this.handleClose}>Close</Button>
          </DialogActions>
        </Dialog>
    );
  }
}

export default TermsAndConditionsDialog;
