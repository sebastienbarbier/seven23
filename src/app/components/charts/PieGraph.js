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

class PieGraph extends Component {
  constructor(props) {
    super(props);

    // DOM element
    this.element = null;

    // Canvas markup
    this.canvas = null;
    this.context = null;

    this.width = null;
    this.height = null;
    this.radius = null;
    this.margin = {top: 50, right: 50, bottom: 50, left: 50};
    this.colors = ["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"];
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
    this.width = +this.element.offsetWidth - 1 - this.margin.left - this.margin.right;
    this.height = +this.element.offsetHeight - 1 - this.margin.top - this.margin.bottom - 20;
    this.radius = Math.min(this.width, this.height) / 2;

    // Initialize graph
    this.canvas = d3.select(this.element).append('canvas');
    this.canvas.attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);

    this.canvas = this.element.querySelector("canvas");
    this.context = this.element.querySelector("canvas").getContext("2d");


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

      if (this.pie) {
        this.pie.remove();
      }

      this.draw(nextProps.values);

    } else {
      if (this.pie) {
        this.pie.remove();
      }
    }
  }

  draw(values) {

    let that = this;

    let arc = d3.arc()
      .outerRadius(this.radius - 10)
      .innerRadius(0)
      .context(this.context);

    let labelArc = d3.arc()
      .outerRadius(this.radius - 40)
      .innerRadius(this.radius - 40)
      .context(this.context);

    this.pie = d3.pie()
      .sort(null)
      .value(function(d) { return d.expenses > 0 ? d.expenses : d.expenses*-1; });

    this.context.translate(
      (this.width + this.margin.left + this.margin.right) / 2,
      (this.height + this.margin.top + this.margin.bottom) / 2);

      var arcs = that.pie(values);

      arcs.forEach(function(d, i) {
        that.context.beginPath();
        arc(d);
        that.context.fillStyle = that.colors[i%7];
        that.context.fill();
      });

      that.context.beginPath();
      arcs.forEach(arc);
      that.context.strokeStyle = "#fff";
      that.context.stroke();

      that.context.textAlign = "center";
      that.context.textBaseline = "middle";
      that.context.fillStyle = "#000";
      arcs.forEach(function(d) {
        var c = labelArc.centroid(d);
        that.context.fillText(d.data.name, c[0], c[1]);
      });
  }

  render() {
    return (
      ''
    );
  }
}

export default PieGraph;
