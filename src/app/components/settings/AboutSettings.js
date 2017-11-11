import React, {Component} from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';

import { Card, CardActions, CardText, CardTitle } from 'material-ui/Card';

const styles = {
  container: {
    fontSize: '1.1em',
    height: '80%',
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  black: {
    color: 'black'
  },
  sebastienbarbier: {
    height: '1.8em',
    paddingBottom: '1px',
    verticalAlign: 'bottom'
  }
};

class AboutSettings extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
    });
  }

  render() {
    return [
      <div style={styles.container}>
        <div>
          <h1 style={{ fontSize: '3em', padding: '5px 0 20px 0' }}>Seven23</h1>
          <p>Website : <a style={styles.black} href="https://seven23.io">seven23.io</a></p>
          <p>Twitter : <a style={styles.black} href="https://twitter.com/seven23app">@Seven23app</a></p>
          <p style={{ paddingTop: '10px', fontSize: '0.9em' }}>Powered with ❤️ by <a style={styles.black} href="https://sebastienbarbier.com">
          <img src="/images/sebastienbarbier.svg" alt="Sébastien Barbier" style={styles.sebastienbarbier}/></a>.</p>
        </div>
      </div>
    ];
  }
}

export default muiThemeable()(AboutSettings);
