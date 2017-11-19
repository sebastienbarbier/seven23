/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";
import moment from "moment";
import * as d3 from "d3";

import CurrencyStore from "../../stores/CurrencyStore";

const styles = {};

class BarGraph extends Component {
  constructor(props) {
    super(props);

    // DOM element
    this.element = null;
    this.ratio = props.ratio || "50%";
    this.isLoading = props.isLoading;

    // SVG markup
    this.svg = null;
    this.width = null;
    this.height = null;
    this.margin = { top: 10, right: 10, bottom: 30, left: 50 };

    // Axes from graph
    this.x = null;
    this.y = null;

    // Points to display on hover effect
    this.graph = null;
    this.values = props.values || [];
  }

  componentDidMount() {
    // DOM element related ot this document
    this.element = ReactDOM.findDOMNode(this).parentNode;
    // Define width and height based on parent DOM element
    //

    // Initialize graph
    this.svg = d3
      .select(this.element)
      .append("div")
      .classed("svg-container", true) //container class to make it responsive
      .style("padding-bottom", this.ratio)
      .append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet") //.attr("viewBox", "0 0 600 400")
      .classed("svg-content-responsive", true);

    let that = this;

    if (this.values) {
      this.draw(this.values);
    }

    window.addEventListener("optimizedResize", this.handleResize, false);
  }

  componentWillUnmount() {
    window.removeEventListener("optimizedResize", this.handleResize, false);
  }

  handleResize = () => {
    this.draw();
  };

  componentWillReceiveProps(nextProps) {
    // Generalte an array with date, income outcome value

    this.values = nextProps.values || [];

    if (this.isLoading != nextProps.isLoading || this.values.length) {
      this.isLoading = nextProps.isLoading;
      this.draw(this.values);
    } else {
      if (this.graph && !this.values) {
        this.graph.remove();
      }
    }
  }

  generateLoadingValues() {
    let res = [];
    for (let i = 0; i < 31; i++) {
      res.push({
        date: moment()
          .startOf("month")
          .add(i, "day")
          .toDate(),
        value: Math.random(),
      });
    }
    return res;
  }

  draw(values = this.values) {
    if (this.graph) {
      this.graph.remove();
    }

    if (this.isLoading) {
      values = [
        {
          color: "#E0E0E0",
          values: this.generateLoadingValues(),
        },
      ];
    }

    let that = this;

    this.width =
      +this.element.offsetWidth - 1 - this.margin.left - this.margin.right;
    this.height =
      +this.width / (100 / parseInt(this.ratio.replace("%", ""))) -
      this.margin.top -
      this.margin.bottom;

    // Define axes
    (this.x = d3
      .scaleBand()
      .rangeRound([0, this.width - this.margin.left - this.margin.right])
      .padding(0.1)),
      (this.y = d3.scaleLinear().rangeRound([this.height, 0]));

    // Define domain
    let array = [];
    values.forEach(line => {
      array = array.concat(line.values);
    });

    let range = n => [...Array(n).keys()]; // [0, ..., ... n-1]

    if (array.length) {
      that.x.domain(
        range(
          moment(array[0].date)
            .endOf("month")
            .date()
        ).map(d => {
          return d + 1;
        })
      );
    } else {
      that.x.domain([]);
    }

    that.y.domain([
      0,
      d3.max(array, function(d) {
        return d.value;
      }),
    ]);

    // Draw graph
    this.graph = this.svg
      .attr(
        "viewBox",
        `0 0 ${this.width} ${this.height +
          this.margin.top +
          this.margin.bottom}`
      )
      .append("g")
      .attr(
        "transform",
        "translate(" + this.margin.left + "," + this.margin.top + ")"
      );

    // Draw axes with defined domain
    const xaxis = this.graph
      .append("g")
      .attr("transform", "translate(0," + this.height + ")")
      .call(
        d3.axisBottom(this.x).tickFormat(d => {
          return d % 2 ? d : "";
        })
      );

    xaxis.select(".domain").remove();

    const yaxis = this.graph.append("g").call(d3.axisLeft(this.y));

    if (that.isLoading) {
      yaxis.select(".domain").remove();
      xaxis.selectAll(".tick").remove();
      yaxis.selectAll(".tick").remove();
    }

    // yaxis.append("text")
    //   .attr("fill", this.isLoading ? "#E0E0E0" : "#000")
    //   .attr("x", 0)
    //   .attr("y", -18)
    //   .attr("dy", "0.71em")
    //   .attr("text-anchor", "end");

    // Draw lines
    values.forEach(line => {
      line.line = that.graph
        .selectAll(".bar")
        .data(line.values)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("fill", line.color ? line.color : "var(--primary-color)")
        .attr("x", function(d) {
          return that.x(d.date.getDate());
        })
        .attr("y", function(d) {
          return that.y(d.value);
        })
        .attr("width", that.x.bandwidth())
        .attr("height", function(d) {
          return that.height - that.y(d.value);
        })
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
    return "";
  }
}

export default BarGraph;
