/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, {Component} from 'react';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';

import {blueGrey500} from 'material-ui/styles/colors';

const styles = {
  header: {
    margin: '5px 0px',
    color: 'white',
    background: blueGrey500,
    padding: '20px 0px 30px 20px',
  },
  headerTitle: {
    color: 'white',
    fontSize: '4em',
  },
  headerText: {
    color: 'white',
  },
};

class Settings extends Component {

  render() {
    return (
    <div>
      <Card style={styles.header}>
        <CardText style={styles.headerText}>
          <h1 style={styles.headerTitle}>Settings</h1>
        </CardText>
      </Card>
    </div>
    );
  }
}

export default Settings;
