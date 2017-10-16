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

class MonthLineBar extends Component {
  constructor(props) {
    super(props);

    // DOM element
    this.element = null;

    // SVG markup
    this.svg = null;
    this.width = null;
    this.height = null;
    this.margin = {top: 20, right: 50, bottom: 30, left: 50};

    // Axes from graph
    this.x = null;
    this.y = null;

    // Define line styling
    this.line = null;
    // Lines to draw
    this.lineExpenses = null;
    this.lineIncomes = null;

    // Points to display on hover
    this.pointIncomes = null;
    this.pointExpenses = null;

    // Points to display on hover effect
    this.graph = null;

    // Move event function
    this.onMouseMove = null;
  }

  componentWillMount() {

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

    // Define points
    // Incomes point
    this.pointIncomes = this.svg.append("g")
        .attr("class", "focus")
        .style("display", "none");

    this.pointIncomes.append("circle")
      .attr("fill", "steelblue")
      .attr("r", 4.5);

    this.pointIncomes.append("text")
      .attr("fill", "black")
      .attr("x", 9)
      .attr("dy", ".35em");

    // Expenses point
    this.pointExpenses = this.svg.append("g")
      .attr("class", "focus")
      .style("display", "none");

    this.pointExpenses.append("circle")
      .attr("fill", "red")
      .attr("r", 4.5);

    this.pointExpenses.append("text")
      .attr("fill", "black")
      .attr("x", 9)
      .attr("dy", ".35em");

    // Draw graph


  }

  componentWillUnmount() {

  }

  componentWillReceiveProps(nextProps) {
    // Generalte an array with date, income outcome value

    if (nextProps.values) {

      let that = this;

      // MANIPULATE DATAS
      let data = {};
      Object.keys(nextProps.values.perDates).forEach((year) => {
        Object.keys(nextProps.values.perDates[year].months).forEach((month) => {
          data[new Date(year, month)] = {
            expenses : +nextProps.values.perDates[year].months[month].expenses * -1,
            incomes: nextProps.values.perDates[year].months[month].incomes
          };
        })
      });

      let dataIncome = Object.keys(data).map((key) => { return { date: new Date(key), value: data[key].incomes }});
      let dataExpenses = Object.keys(data).map((key) => { return { date: new Date(key), value: data[key].expenses }});

      that.x.domain(d3.extent(dataIncome, function(d) { return new Date(d.date); }));
      that.y.domain(d3.extent(dataIncome.concat(dataExpenses), function(d) { return d.value }));

      if (this.graph) {
        this.graph.remove();
      }

      this.graph = this.svg.attr('width', this.width + this.margin.left + this.margin.bottom)
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
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Price");

      // Draw lines
      that.graph.append("path")
        .datum(dataIncome)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 2)
        .attr("d", that.line);

      that.graph.append("path")
        .datum(dataExpenses)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 2)
        .attr("d", that.line);

      // Hover zone
      this.svg.append("rect")
        .attr("class", "overlay")
        .attr("fill", "none")
        .attr("pointer-events", "all")
        .attr("width", this.width)
        .attr("height", this.height)
        .on("mouseover", function() { that.pointIncomes.style("display", null); that.pointExpenses.style("display", null); })
        .on("mouseout", function() { that.pointIncomes.style("display", "none"); that.pointExpenses.style("display", "none"); })
        .on("mousemove", onMouseMove);

      function onMouseMove() {
        var x0 = that.x.invert(d3.mouse(this)[0]);
        var d = new Date(x0.getFullYear(), x0.getMonth());
        var data = dataIncome.find((item) => { return item.date.getTime() === d.getTime()});

        that.pointIncomes.attr("transform", "translate(" + (that.x(data.date) + that.margin.left) + "," + (that.y(data.value) + that.margin.top) + ")");
        that.pointIncomes.select("text").text(CurrencyStore.format(data.value));

        var data2 = dataExpenses.find((item) => { return item.date.getTime() === d.getTime()});

        that.pointExpenses.attr("transform", "translate(" + (that.x(data2.date) + that.margin.left) + "," + (that.y(data2.value) + that.margin.top) + ")");
        that.pointExpenses.select("text").text(CurrencyStore.format(data2.value));
      };
    } else {
      if (this.graph) {
        this.graph.remove();
      }
    }
  }

  render() {
    return (
      ''
    );
  }
}

export default MonthLineBar;
