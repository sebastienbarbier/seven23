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

class MonthLineGraph extends Component {
  constructor(props) {
    super(props);

    // DOM element
    this.element = null;
    this.ratio = props.ratio || '50%';

    // SVG markup
    this.svg = null;
    this.width = null;
    this.height = null;
    this.margin = {top: 0, right: 50, bottom: 20, left: 50};

    // Axes from graph
    this.x = null;
    this.y = null;

    // Define line styling
    this.line = null;

    // Points to display on hover effect
    this.graph = null;

    // Move event function
    this.onMouseMove = null;
    this.onClick = props.onClick;
  }

  componentDidMount() {
    // DOM element related ot this document
    this.element = ReactDOM.findDOMNode(this).parentNode;

    // Initialize graph
    this.svg = d3.select(this.element)
                 .append("div")
                 .classed("svg-container", true) //container class to make it responsive
                 .style('padding-bottom', this.ratio)
                 .append('svg')
                 .attr("preserveAspectRatio", "xMinYMin meet") //.attr("viewBox", "0 0 600 400")
                 .classed("svg-content-responsive", true);

    if (this.values) {
      this.draw();
    }
    window.addEventListener("optimizedResize", this.handleResize, false);
  }

  componentWillUnmount() {
    window.removeEventListener("optimizedResize", this.handleResize, false);
  }

  handleResize = () => {
     this.draw();
  };

  // Expect stats to be
  // stats = [
  //  { color: '', values: [{ date: '', value: ''}, {}]},
  //  {}
  // ]
  componentWillReceiveProps(nextProps) {
    // Generalte an array with date, income outcome value

    if (nextProps.values) {

      this.values = nextProps.values;
      this.draw(nextProps.values);

    } else {
      if (this.graph) {
        this.graph.remove();
      }
    }
  }

  draw(values = this.values) {

    if (this.graph) {
      this.graph.remove();
    }

    let that = this;

    // Define domain
    let array = [];
    values.forEach((line) => {
      array = array.concat(line.values);
    });

    // Define width and height based on parent DOM element
    this.width = +this.element.offsetWidth - this.margin.left - this.margin.right;
    this.height = +this.width / (100 / parseInt(this.ratio.replace('%', ''))) - this.margin.top - this.margin.bottom;

    // Define axes
    this.x = d3.scaleTime().rangeRound([0, this.width - this.margin.right]);
    this.y = d3.scaleLinear().rangeRound([this.height - this.margin.bottom, 0]);

    that.x.domain(d3.extent(array, function(d) { return d.date; }));
    that.y.domain([0, d3.max(array, function(d) { return d.value; }) * 1.1]);

    this.line = d3.line()
      .x(function(d) { return that.x(d.date); })
      .y(function(d) { return that.y(d.value); });

    // Draw graph
    this.graph = this.svg
      .attr('viewBox', `0 0 ${this.width + this.margin.right} ${this.height + this.margin.top + this.margin.bottom}`)
      .append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");


    // Draw axes with defined domain
    this.graph.append("g")
      .attr("transform", "translate(0," + (this.height - this.margin.bottom) + ")")
      .call(d3.axisBottom(this.x))
      .select(".domain")
      .remove();

    this.graph.append("g")
      .call(d3.axisLeft(this.y))
      .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Price");

    // Draw lines
    values.forEach((line) => {
      // Draw line
      that.graph.append("path")
        .datum(line.values)
        .attr("fill", "none")
        .attr("stroke", line.color ? line.color : 'var(--primary-color)')
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 2)
        .attr("d", that.line);

      // Draw point
      line.point = this.svg.append("g")
        .attr("class", "focus")
        .style("display", "none");

      line.point.append("circle")
        .attr("fill", line.color ? line.color : 'var(--primary-color)')
        .attr("r", 4.5);

      line.point.append("text")
        .attr("fill", "black")
        .attr("x", 9)
        .attr("dy", ".35em");
    });

    // Hover zone
    this.svg.append("rect")
      .attr("class", "overlay")
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .attr("width", this.width)
      .attr("height", this.height)
      .style("cursor", that.onClick ? "pointer" : "default")
      .on("mouseover", function() {
        values.forEach((line) => {
          line.point.style("display", null);
        });
      })
      .on("mouseout", function() {
        values.forEach((line) => {
          line.point.style("display", "none");
        });
      })
      .on("touchmove", onMouseMove)
      .on("mousemove", onMouseMove)
      .on("click", onClick);

    let hoverDate = null;
    let activateCliek = false;

    function onClick() {
      if (that.onClick) {
        var x0 = moment(that.x.invert(d3.mouse(this)[0] - that.margin.left));
        if (x0.date() >= 15) {
          x0.add(15, 'day');
        }
        if (hoverDate.getTime() == new Date(x0.year(), x0.month()).getTime()) {
          that.onClick(new Date(x0.year(), x0.month()));
        } else {
          onMouseMove();
        }
      }
    }

    function onMouseMove() {
      // var x0 = that.x.invert(d3.mouse(this)[0]);
      // var d = new Date(x0.getFullYear(), x0.getMonth());

      console.log('onMouseMove');
      var x0 = moment(that.x.invert(d3.mouse(this)[0] - that.margin.left));
      if (x0.date() >= 15) {
        x0.add(15, 'day');
      }
      hoverDate = new Date(x0.year(), x0.month());

      values.forEach((line) => {
        var data = line.values.find((item) => { return item.date.getTime() ===hoverDate.getTime()});
        if (data && data.value) {
          line.point.style("display", null);
          line.point.attr("transform", "translate(" + (that.x(data.date) + that.margin.left) + "," + (that.y(data.value) + that.margin.top) + ")");
          line.point.select("text").text(CurrencyStore.format(data.value));
        } else {
          line.point.style("display", "none");
        }
      });
    };
  }

  render() {
    return (
      ''
    );
  }
}

export default MonthLineGraph;
