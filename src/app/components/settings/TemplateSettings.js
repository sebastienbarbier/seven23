import React, { Component } from "react";
import muiThemeable from "material-ui/styles/muiThemeable";

import { Card, CardActions, CardText, CardTitle } from "material-ui/Card";

const styles = {};

class TemplateSettings extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {};
  }

  componentWillReceiveProps(nextProps) {
    this.setState({});
  }

  render() {
    return [
      <div className="grid">
        <div className="small">
          <Card>
            <CardTitle title="Coming Soon" />
          </Card>
        </div>
      </div>
    ];
  }
}

export default muiThemeable()(TemplateSettings);
