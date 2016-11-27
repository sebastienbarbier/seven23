import React, {Component} from 'react';

import {Card, CardText, CardTitle} from 'material-ui/Card';
import Favorite from 'material-ui/svg-icons/action/favorite';
import {red600} from 'material-ui/styles/colors';

const styles = {
  favorite: {
    width: '20px',
    position: 'relative',
    top: '5px',
    left: '4px',
  },
};

class About extends Component {

  constructor(props, context) {

    super(props, context);
  }

  render() {
    return (
      <Card>
        <CardText expandable={false}>
          <p className="poweredby">Powered by <a href="https://sebastienbarbier.com" target="_blank"><img src="images/sebastienbarbier.logo.png" alt="Sébastien BARBIER" style={styles.logo} /></a> with <Favorite style={styles.favorite} color={red600} /></p>
        </CardText>
      </Card>
    );
  }
}

export default About;
