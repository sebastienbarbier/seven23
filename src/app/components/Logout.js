/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from "react";
import PropTypes from "prop-types";

import UserActions from "../actions/UserActions";
import UserStore from "../stores/UserStore";

class Logout extends Component {
  constructor(props, context) {
    super(props, context);
    this.context = context;
    this.history = props.history;
  }

  componentWillMount() {
    var self = this;

    UserStore.onceChangeListener(() => {
      self.history.replace("/login");
    });

    UserActions.logout();
  }

  render() {
    return <div />;
  }
}

export default Logout;
