import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import ChartJS from 'chart.js';

class TransactionChartDailySum extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      config: props.config,
    };
  }

  componentDidMount() {
    this.graph = new ChartJS(ReactDOM.findDOMNode(this), this.state.config);
    this.graph.update();
  }

  componentWillUnmount() {
    this.graph.destroy();
  }

  render() {
    return (
      <canvas id="myChart" width="400" height="200"></canvas>
    );
  }

}

export default TransactionChartDailySum;
