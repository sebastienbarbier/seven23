/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, {Component} from 'react';
import MonthView from './transactions/MonthView';

class Transactions extends Component {

  constructor(props, context) {

    let now = new Date();
    super(props, context);

    this.state = {
      transactions: [],
      loading: false,
      year: props.params.year ? props.params.year : now.getFullYear(),
      month: props.params.month ? props.params.month : (now.getMonth()%12+1),
    };
    this.context = context;
  }

  componentWillReceiveProps(nextProps) {
    let now = new Date();
    this.setState({
      year: nextProps.params.year ? nextProps.params.year : now.getFullYear(),
      month: nextProps.params.month ? nextProps.params.month : (now.getMonth()%12+1),
    });
  }

  render() {
    return (
      <MonthView year={this.state.year} month={this.state.month}></MonthView>
    );
  }
}

export default Transactions;
