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
    fontSize: "1.1em",
    maxWidth: "600px"
  },
  black: {
    color: "black"
  },
  sebastienbarbier: {
    height: "1.8em",
    paddingBottom: "1px",
    verticalAlign: "bottom"
  }
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
          <h1 style={{ fontSize: "3em", padding: "5px 0 20px 0" }}>
            Help and Support
          </h1>
          <p>
            <strong>Aïe #!</strong> I was about to thank you for using Seven23,
            but if you are visiting this page chances are high that you are
            experimenting some issues you could't fix by yourself. No worry, we
            have your back and will do everything we can to help.
          </p>
          <p>
            First, consult our{" "}
            <a href="https://seven23.io">frequently asked question</a> section
            on seven23.io website. Never know, might be that simple.
          </p>
          <p>
            If you found a bug, please help by{" "}
            <a href="https://github.com/sebastienbarbier/seven23_webapp/issues">
              reporting it on our tracker hosted by github
            </a>.
          </p>
          <p>
            If it doesn't help, an email could be the solution:{" "}
            <a href="mailto:seven23@sebastienbarbier.com">
              seven23@sebastienbarbier.com
            </a>
          </p>
          <p>
            And if after all of this still nothing happened, feel free to reach
            use directly on twitter using{" "}
            <a href="https://twitter.com/seven23App">@Seven23App</a> or even my
            personnal account{" "}
            <a href="https://twitter.com/sebbarbier">@SebBarbier</a>.
          </p>
          <p>
            If after all of those you still have no answer or solution, you
            should probably not stay here and we should not have your trust. I
            can only say sorry for the disapointment, hopefully the export
            feature will be already developed.
          </p>
        </div>
      </div>
    ];
  }
}

export default muiThemeable()(HelpSettings);
