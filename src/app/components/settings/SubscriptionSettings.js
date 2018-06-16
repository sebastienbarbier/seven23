import React, { Component } from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';

const styles = {
  container: {
    fontSize: '1.1em',
    height: '80%',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    maxWidth: '600px',
  },
  black: {
    color: 'black',
  },
  sebastienbarbier: {
    height: '1.8em',
    paddingBottom: '1px',
    verticalAlign: 'bottom',
    fontSize: '1.1em',
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
          <h1 style={{ fontSize: '3em', padding: '5px 0 20px 0' }}>
            Subscription
          </h1>
          <p>
            For now Seven23 is on beta, free to use, and will stay like this
            until we reach a critical size beta tester. If you read this,
            congratulation your are one of them 👍.
          </p>
          <p>
            As a member of that community, you will have benefits on launch day
            but no date has been planned yet. You can be sure to be the first
            notify when this change.
          </p>
          <p>
            Pricing should be 29€/year, all features included. Of course the
            application will always be available as self-hosted.
          </p>
          <p>
            If you have any question, feel free to ask directly by mail at{' '}
            <a href="mailto:seven23@sebastienbarbier.com">
              seven23@sebastienbarbier.com
            </a>.
          </p>
        </div>
      </div>,
    ];
  }
}

export default muiThemeable()(SubscriptionSettings);
