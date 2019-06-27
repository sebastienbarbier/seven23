/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import { Component } from "react";
import ReactDOM from "react-dom";
import * as d3 from "d3";

class LineGraph extends Component {
  constructor(props) {
    super(props);

    // DOM element
    this.element = null;

    // SVG markup
    this.svg = null;
    this.width = null;
    this.height = null;
    this.margin = { top: 5, right: 5, bottom: 5, left: 5 };

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

    // Initialize graph
    this.svg = d3
      .select(this.element)
      .append("div")
      .classed("svg-container", true) //container class to make it responsive
      .style("padding-bottom", "60px")
      .append("svg")
      .classed("svg-content-responsive", true);

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

  // Expect stats to be
  // stats = [
  //  { color: '', values: [{ date: '', value: ''}, {}]},
  //  {}
  // ]
  componentWillReceiveProps(nextProps) {
    // Generalte an array with date, income outcome value
    if (nextProps.values) {
      this.values = nextProps.values;
      this.draw(this.values);
    } else {
      if (this.graph) {
        this.graph.remove();
      }
    }
  }

  draw(values = this.values) {
    if (!values[0].values) {
      return;
    }

    if (this.graph) {
      this.graph.remove();
    }

    let that = this;

    // Define width and height based on parent DOM element
    this.width =
      +this.element.offsetWidth - 1 - this.margin.left - this.margin.right;
    this.height = 50 - this.margin.top - this.margin.bottom;

    // Define axes
    this.x = d3.scaleTime().rangeRound([0, this.width]);
    this.y = d3.scaleLinear().rangeRound([this.height, 0]);

    this.line = d3
      .line()
      .x(function(d) {
        return that.x(d.date);
      })
      .y(function(d) {
        return that.y(d.value);
      });

    // Define domain
    let array = [];
    values.forEach(line => {
      array = array.concat(line.values);
    });
    that.x.domain(
      d3.extent(array, function(d) {
        return d.date;
      })
    );

    const range = d3.extent(array, function(d) {
      return d.value;
    });
    that.y.domain([range[0] * 0.9, range[1] * 1.1]);

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

    // Draw lines
    this.values.forEach(line => {
      // Draw line
      that.graph
        .append("path")
        .datum(line.values)
        .attr("fill", "none")
        .attr("stroke", line.color ? line.color : "var(--primary-color)")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 3)
        .attr("d", that.line);
    });
  }

  render() {
    return "";
  }
}

export default LineGraph;
