/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, {Component} from 'react';

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
      </div>
    );
  }
}


export default MonthPicker;
