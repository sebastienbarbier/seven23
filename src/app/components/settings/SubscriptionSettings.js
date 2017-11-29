import React, { Component } from "react";
import muiThemeable from "material-ui/styles/muiThemeable";

import { Card, CardActions, CardText, CardTitle } from "material-ui/Card";

const styles = {
  container: {
    fontSize: "1.1em",
    height: "80%",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  black: {
    color: "black",
  },
  sebastienbarbier: {
    height: "1.8em",
    paddingBottom: "1px",
    verticalAlign: "bottom",
  },
};

class SubscriptionSettings extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {};
  }

  componentWillReceiveProps(nextProps) {
    this.setState({});
  }

  render() {
    return [
      <div style={styles.container}>
        <div>
          <h1 style={{ fontSize: "3em", padding: "5px 0 20px 0" }}>Subscription</h1>
          <p>Beta is free, release 2018, price 29€, great offer for beta tester.</p>
        </div>
      </div>,
    ];
  }
}

export default muiThemeable()(SubscriptionSettings);
