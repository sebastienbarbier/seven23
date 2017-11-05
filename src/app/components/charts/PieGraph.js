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
    this.ratio = props.ratio || '100%';

    // Canvas markup
    this.svg = null;
    this.g = null;

    this.width = null;
    this.height = null;
    this.radius = null;

    this.margin = {top: 50, right: 50, bottom: 50, left: 50};

    this.colors = d3.scaleOrdinal(['#90caf9','#42a5f5','#2196f3','#42a5f5']);

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
    this.svg = d3.select(this.element)
                 .append("div")
                 .classed("svg-container", true) //container class to make it responsive
                 .style('padding-bottom', this.ratio)
                 .append('svg')
                 .attr("preserveAspectRatio", "xMinYMin meet") //.attr("viewBox", "0 0 600 400")
                 .classed("svg-content-responsive", true);

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

    this.graph = this.svg
      .attr('viewBox', `0 0 ${this.width} ${this.height + this.margin.top + this.margin.bottom}`)
      .append("g")
      .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");

    this.pie = d3.pie()
      .sort(null)
      .value(function(d) { return d.expenses > 0 ? d.expenses : d.expenses*-1; });

    let path = d3.arc()
      .outerRadius(this.radius - 10)
      .innerRadius(0);

    let label = d3.arc()
      .outerRadius(this.radius - 40)
      .innerRadius(this.radius - 40);

    let arc = this.graph.selectAll(".arc")
      .data(this.pie(values))
      .enter().append("g")
      .attr("class", "arc");

    arc.append("path")
      .attr("d", path)
      .attr("fill", function(d) { return that.colors(d.data.expenses); });

    arc.append("text")
      .attr("transform", function(d) { return "translate(" + label.centroid(d) + ")"; })
      .attr("dy", "0.35em")
      .text(function(d) { return d.data ? d.data.name : ''; });

    // var arcs = that.pie(values);

    // arcs.forEach(function(d, i) {
    //   that.context.beginPath();
    //   arc(d);
    //   that.context.fillStyle = that.colors[i%that.colors.length];
    //   that.context.fill();
    // });

    // that.context.beginPath();
    // arcs.forEach(arc);
    // that.context.strokeStyle = "#fff";
    // that.context.stroke();

    // that.context.textAlign = "center";
    // that.context.textBaseline = "middle";
    // that.context.fillStyle = "#000";
    // arcs.forEach(function(d) {
    //   var c = labelArc.centroid(d);
    //   that.context.fillText(d.data ? d.data.name : '', c[0], c[1]);
    // });
  }

  render() {
    return (
      ''
    );
  }
}

export default PieGraph;
