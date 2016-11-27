import React, {Component} from 'react';

import {Card, CardText, CardTitle} from 'material-ui/Card';

class ForgottenPasswordForm extends Component {

  constructor(props, context) {
    super(props, context);
  }

  handleChangeUrl = (event) => {

  };

  render() {
    return (
      <Card>
        <CardTitle title="Forgotten password" subtitle="Having trouble logging with your account ?" />
        <CardText expandable={false}>

        </CardText>
      </Card>
    );
  }
}

export default ForgottenPasswordForm;
