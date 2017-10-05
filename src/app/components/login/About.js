import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {Card, CardText} from 'material-ui/Card';
import Favorite from 'material-ui/svg-icons/action/favorite';
import {red600} from 'material-ui/styles/colors';

const styles = {
  favorite: {
    position: 'relative',
    top: '5px',
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
          <p className="poweredby">Powered with <Favorite style={styles.favorite} color={red600} /> by <a href="https://sebastienbarbier.com" target="_blank"><img src="images/sebastienbarbier.logo.png" alt="Sébastien BARBIER" style={styles.logo} /></a></p>
        </CardText>
      </Card>
    );
  }
}

export default About;
