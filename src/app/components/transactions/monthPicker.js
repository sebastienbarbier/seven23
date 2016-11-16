/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, {Component} from 'react';
import moment from 'moment';

import { Router, Route, Link, browserHistory } from 'react-router';
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';

const styles = {
  chip: {
    margin: 4,
  },
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap',
  },
};

class MonthPicker extends Component {
  constructor(props) {
    super(props);

    this.state = {
      year: 2016,
    };
  }

  componentWillMount() {

  }

  componentWillUnmount() {

  }

  render() {
    return (
      <div style={styles.wrapper}>
          { Array.from(Array(12).keys()).map((index) => {
            return (
              <Chip
                key={index}
                style={styles.chip}>
                <Link to={`/transactions/${this.state.year}/${index+1}`}>{moment.months()[index]}</Link>
              </Chip>
            )
          })}
      </div>
    );
  }
}

export default MonthPicker;
