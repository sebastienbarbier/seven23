/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom'
import moment from 'moment';
import * as d3 from "d3";

import CurrencyStore from '../../stores/CurrencyStore';

const styles = {
};

class BarGraph extends Component {
  constructor(props) {
    super(props);

    // DOM element
    this.element = null;

    // SVG markup
    this.svg = null;
    this.width = null;
    this.height = null;
    this.margin = {top: 20, right: 10, bottom: 30, left: 50};

    // Axes from graph
    this.x = null;
    this.y = null;

    // Points to display on hover effect
    this.graph = null;
    this.values = props.values;
  }

  componentDidMount() {
    // DOM element related ot this document
    this.element = ReactDOM.findDOMNode(this).parentNode;
    // Define width and height based on parent DOM element
    //

    this.width = +this.element.offsetWidth - 1 - this.margin.left - this.margin.right;
    this.height = +this.element.offsetHeight - 1 - this.margin.top - this.margin.bottom - 20;

    // Define axes
    this.x = d3.scaleBand().rangeRound([0, this.width]).padding(0.1),
    this.y = d3.scaleLinear().rangeRound([this.height, 0]);

    // Initialize graph
    this.svg = d3.select(this.element).append('svg');

    let that = this;

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

      this.draw(nextProps.values);

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

    let range = n => [...Array(n).keys()]; // [0, ..., ... n-1]

    if (array.length) {
      that.x.domain(range(moment(array[0].date).endOf('month').date()).map((d) => { return d+1; }));
    } else {
      that.x.domain([]);
    }

    that.y.domain(d3.extent(array, function(d) { return d.value; }));

    // Draw graph
    this.graph = this.svg.attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    // Draw axes with defined domain
    this.graph.append("g")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(this.x))
      .select(".domain")
      .remove();

    this.graph.append("g")
      .call(d3.axisLeft(this.y))
      .append("text")
      .attr("fill", "#000")
      .attr("x", 0)
      .attr("y", -18)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end");

    // Draw lines
    values.forEach((line) => {

      that.graph.selectAll(".bar")
        .data(line.values)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("fill", line.color ? line.color : 'var(--primary-color)')
        .attr("x", function(d) { return that.x(d.date.getDate()); })
        .attr("y", function(d) { return that.y(d.value); })
        .attr("width", that.x.bandwidth())
        .attr("height", function(d) { return that.height - that.y(d.value); })
        .on("mouseover", function(element) {
          // do something
        })
        .on("click", function(element) {
          // do something
        })
        .on("mouseout", function(element) {
          // do something
        });
    });
  }


  render() {
    return (
      ''
    );
  }
}

export default BarGraph;
