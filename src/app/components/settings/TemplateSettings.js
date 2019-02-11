import React, { Component } from 'react';

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';

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
          <Card square>
            <CardHeader title="Coming Soon" />
          </Card>
        </div>
      </div>,
    ];
  }
}

export default TemplateSettings;