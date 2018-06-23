/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from 'react';

import Button from '@material-ui/core/Button';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

class CategoryDelete extends Component {
  constructor(props, context) {
    super(props, context);

    this.context = context;
    this.props = props;
    this.state = {
      category: props.category,
      open: props.open,
    };

    this.actions = [
      ,
    ];
  }

  handleCloseDelete = () => {
    this.setState({
      open: false,
    });
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      category: nextProps.category,
      open: nextProps.open,
      error: {}, // error messages in form from WS
    });
  }

  render() {
    return (
      <Dialog
        open={this.state.open}
        onClose={this.handleCloseDelete}
        modal={false}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        autoScrollBodyContent={true}
      >
        <DialogTitle id="alert-dialog-title">{`${this.state.category.name} has not been completely deleted`}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <p>
              This category has not been completely deleted because it is still
              assigned to some transactions.
            </p>
            <p>
              It will be hidden from your list of category, but can be diplay using
              the toggle option at the end if it.
            </p>
            <p>
              To permamently delete a category, you first need to make sure there is
              no transaction using it.
            </p>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            primary={true}
            onClick={this.handleCloseDelete}
          >I understand</Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default CategoryDelete;
