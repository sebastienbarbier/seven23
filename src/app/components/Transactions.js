/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';

class Transactions extends Component {

  constructor(props, context) {
    super(props, context);
    this.history = props.history;
    this.location = props.location;
    this.context = context;

    if (!this.props.children) {
      let now = new Date();
      this.history.push('/transactions/'+now.getFullYear()+'/'+(now.getMonth()%12+1));
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.children) {
      let now = new Date();
      this.history.push('/transactions/'+now.getFullYear()+'/'+(now.getMonth()%12+1));
    }
  }

  render() {
    return (
      <div></div>
    );
  }
}

export default Transactions;
