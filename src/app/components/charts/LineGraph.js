/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom'
import * as d3 from "d3";

import CurrencyStore from '../../stores/CurrencyStore';

const styles = {
};

class LineGraph extends Component {
  constructor(props) {
    super(props);

    // DOM element
    this.element = null;

    // SVG markup
    this.svg = null;
    this.width = null;
    this.height = null;
    this.margin = {top: 0, right: 0, bottom: 0, left: 0};

    // Axes from graph
    this.x = null;
    this.y = null;

    // Define line styling
    this.line = null;

    // Points to display on hover effect
    this.graph = null;
    this.values = props.values;
    // Move event function
    this.onMouseMove = null;
  }

  componentDidMount() {
    // DOM element related ot this document
    this.element = ReactDOM.findDOMNode(this).parentNode;
    // Define width and height based on parent DOM element
    this.width = +this.element.offsetWidth - 1 - this.margin.left - this.margin.right;
    this.height = +this.element.offsetHeight - 1 - this.margin.top - this.margin.bottom - 20;

    // Define axes
    this.x = d3.scaleTime().rangeRound([0, this.width]);;
    this.y = d3.scaleLinear().rangeRound([this.height, 0]);

    // Initialize graph
    this.svg = d3.select(this.element).append('svg');

    let that = this;
    this.line = d3.line()
      .x(function(d) { return that.x(d.date); })
      .y(function(d) { return that.y(d.value); });

    if (this.values) {
      this.draw(this.values);
    }
  }

  // Expect stats to be
  // stats = [
  //  { color: '', values: [{ date: '', value: ''}, {}]},
  //  {}
  // ]
  componentWillReceiveProps(nextProps) {
    // Generalte an array with date, income outcome value

    if (nextProps.values) {

      if (this.graph) {
        this.graph.remove();
      }

      this.values = nextProps.values;
      this.draw(this.values);

    } else {
      if (this.graph) {
        this.graph.remove();
      }
    }
  }

  draw(values) {

    let that = this;
    // Define domain
    let array = [];
    values.forEach((line) => {
      array = array.concat(line.values);
    });
    that.x.domain(d3.extent(array, function(d) { return d.date; }));
    that.y.domain(d3.extent(array, function(d) { return d.value; }));

    // Draw graph
    this.graph = this.svg.attr('width', this.width + this.margin.left + this.margin.bottom)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    // Draw lines
    this.values.forEach((line) => {
      // Draw line
      that.graph.append("path")
        .datum(line.values)
        .attr("fill", "none")
        .attr("stroke", line.color ? line.color : 'var(--primary-color)')
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 2)
        .attr("d", that.line);

    });
  }

  render() {
    return (
      ''
    );
  }
}

export default LineGraph;
