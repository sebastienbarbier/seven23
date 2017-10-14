import React, {Component} from 'react';

import muiThemeable from 'material-ui/styles/muiThemeable';

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
        <p>Coming soon</p>
      </div>
    ];
  }
}

export default muiThemeable()(TemplateSettings);
