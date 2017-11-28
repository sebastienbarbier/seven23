import React, { Component } from "react";
import muiThemeable from "material-ui/styles/muiThemeable";

import { Card, CardActions, CardText, CardTitle } from "material-ui/Card";

const styles = {
  container: {
    fontSize: "1.1em",
    height: "80%",
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
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

class HelpSettings extends Component {
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
          <h1 style={{ fontSize: "3em", padding: "5px 0 20px 0" }}>Help and Support</h1>
          <p>Frequently asked question</p>
          <p>Stackover flow using seven23 tag</p>
          <p>Report bugs on github</p>
          <p>Mail help@seven23.com</p>
          <p>Ask on twitter @Seven23App or direclty to me @sebbarbier</p>
        </div>
      </div>,
    ];
  }
}

export default muiThemeable()(HelpSettings);
