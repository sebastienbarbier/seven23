import React, {Component} from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';

import { Card, CardActions, CardText, CardTitle } from 'material-ui/Card';

const styles = {
};

class TemplateSettings extends Component {

  constructor(props, context) {
    super(props, context);
    this.history = props.history;
    console.log(this.history.pathname);
    this.state = {
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
    });
  }

  render() {
    return [
      <div>
        <Card style={{maxWidth: '400px', marginTop: '10px'}}>
          <CardTitle title="Coming Soon" />
        </Card>
      </div>
    ];
  }
}

export default muiThemeable()(TemplateSettings);
