/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
 import React, {Component} from 'react';
 import { Router, Route, Link, browserHistory } from 'react-router';
 import {List, ListItem, makeSelectable} from 'material-ui/List';
 import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
 import FontIcon from 'material-ui/FontIcon';
 import FlatButton from 'material-ui/FlatButton';
 import CircularProgress from 'material-ui/CircularProgress';

 import CategoryActions from '../../actions/CategoryActions';
 import CategoryStore from '../../stores/CategoryStore';

 import Dialog from 'material-ui/Dialog';

 const styles = {
  container: {
    maxWidth: '600px',
    textAlign: 'left',
  },
  'actions': {
    textAlign: 'center',
  },
 };

 class CategoryDelete extends Component {

  constructor(props, context) {
    super(props, context);

    this.context = context;
    this.state = {
      category: props.category,
      open: props.open,
    };

    this.actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleCloseDelete}
      />,
      <FlatButton
        label="Submit"
        primary={true}
        onTouchTap={this.handleDelete}
      />,
    ];
  }

  handleDelete = () => {
    let component = this;

    CategoryStore.onceChangeListener((args) => {
      component.setState({
        open: false,
        loading: false,
      });
    });
    CategoryActions.delete(this.state.category.id);
  };

  handleCloseDelete = () => {
    this.setState({
      open: false,
      loading: false,
    });
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      category: nextProps.category,
      open: nextProps.open,
      loading: false,
      error: {}, // error messages in form from WS
    });
  }

  render() {
    return (
      <Dialog
          title={`Are you sure about deleting ${this.state.category.name} ?`}
          actions={this.actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleCloseDelete}
          autoScrollBodyContent={true}
        >
         <p>This category does not have any transactions, and will be definitely deleted.</p>
      </Dialog>
    );
  }
}

export default CategoryDelete;
