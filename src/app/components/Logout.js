/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import UserActions from '../actions/UserActions';

class Logout extends Component {
  constructor(props, context) {
    super(props, context);
    this.context = context;
    this.history = props.history;
  }

  componentWillMount() {
    const { dispatch } = this.props;

    dispatch(UserActions.logout());
  }

  render() {
    return <div />;
  }
}

Logout.propTypes = {
  dispatch: PropTypes.func.isRequired
};

export default connect()(Logout);
