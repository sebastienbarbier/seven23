import React, {Component} from 'react';

import {Card, CardText} from 'material-ui/Card';

class About extends Component {

  constructor(props, context) {

    super(props, context);
  }

  render() {
    return (
      <Card>
        <CardText expandable={false}>

        </CardText>
      </Card>
    );
  }
}

export default About;
