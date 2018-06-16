/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';

import Dialog from 'material-ui/Dialog';

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
      <FlatButton
        label="I understand"
        primary={true}
        onClick={this.handleCloseDelete}
      />,
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
        title={`${this.state.category.name} has not been completely deleted`}
        actions={this.actions}
        modal={false}
        open={this.state.open}
        onRequestClose={this.handleCloseDelete}
        autoScrollBodyContent={true}
      >
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
      </Dialog>
    );
  }
}

export default CategoryDelete;
