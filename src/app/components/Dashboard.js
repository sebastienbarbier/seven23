/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, {Component} from 'react';
import { Router, Route, Link, browserHistory } from 'react-router'

import {List, ListItem} from 'material-ui/List';
import Divider from 'material-ui/Divider';

const styles = {
};

class Dashboard extends Component {

  render() {
    return (
        <div>
          <h1>Dashboard</h1>
          <p>Coming soon</p>
        </div>
    );
  }
}

export default Dashboard;
