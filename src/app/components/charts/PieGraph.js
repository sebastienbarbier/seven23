/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import { Component } from "react";
import ReactDOM from "react-dom";
import * as d3 from "d3";

class PieGraph extends Component {
  constructor(props) {
    super(props);

    // DOM element
    this.element = null;
    this.ratio = props.ratio || "100%";
    this.isLoading = props.isLoading || false;

    // Canvas markup
    this.svg = null;
    this.g = null;

    this.width = null;
    this.height = null;
    this.radius = null;

    this.margin = { top: 50, right: 50, bottom: 50, left: 50 };

    this.colors = d3.scaleOrdinal(["#C5CAE9", "#9FA8DA", "#7986CB", "#5C6BC0"]);

    this.loadingValues = [
      { expenses: 30 },
      { expenses: 20 },
      { expenses: 10 },
      { expenses: 31 }
    ];
    this.loadingColors = d3.scaleOrdinal([
      "#EEEEEE",
      "#E0E0E0",
      "#BDBDBD",
      "#E8E8E8"
    ]);

    // Points to display on hover effect
    this.graph = null;
    this.values = props.values;
  }

  componentDidMount() {
    // DOM element related ot this document
    this.element = ReactDOM.findDOMNode(this).parentNode;

    // Initialize graph
    this.svg = d3
      .select(this.element)
      .append("div")
      .classed("svg-container", true) //container class to make it responsive
      .style("padding-bottom", this.ratio)
      .append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet") //.attr("viewBox", "0 0 600 400")
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

  componentWillReceiveProps(nextProps) {
    // Generalte an array with date, income outcome value
    this.isLoading = nextProps.isLoading || false;

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
    let that = this;

    if (this.graph) {
      this.graph.remove();
    }

    if (this.isLoading) {
      values = this.loadingValues;
    }

    this.width =
      +this.element.offsetWidth - this.margin.left - this.margin.right;
    this.height =
      +this.element.offsetHeight - this.margin.top - this.margin.bottom;
    this.radius = Math.min(this.width, this.height) / 2;

    if (this.height > this.width) {
      // to keep ratio 1/1
      this.width = this.height;
    }

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
        "translate(" + this.width / 2 + "," + this.height / 2 + ")"
      );

    this.pie = d3
      .pie()
      .sort(null)
      .value(function(d) {
        return d.expenses > 0 ? d.expenses : d.expenses * -1;
      });

    let path = d3
      .arc()
      .outerRadius(this.radius - 10)
      .innerRadius(0);

    let label = d3
      .arc()
      .outerRadius(this.radius - 40)
      .innerRadius(this.radius - 40);

    let arc = this.graph
      .selectAll(".arc")
      .data(this.pie(values))
      .enter()
      .append("g")
      .attr("class", "arc");

    arc
      .append("path")
      .attr("d", path)
      .attr("fill", function(d) {
        return that.isLoading
          ? that.loadingColors(d.data.expenses)
          : that.colors(d.data.expenses);
      });

    arc
      .append("text")
      .attr("transform", function(d) {
        return "translate(" + label.centroid(d) + ")";
      })
      .attr("dy", "0.35em")
      .text(function(d) {
        return d.data ? d.data.name : "";
      });
  }

  render() {
    return "";
  }
}

export default PieGraph;
