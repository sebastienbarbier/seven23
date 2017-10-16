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
    this.x = null;
    this.y = null;
    this.lineExpenses = null;
    this.lineIncome = null;
    this.g = null;
    this.height;
    this.width;
    this.margin
    this.state = {
      values: props.values,
      rootNode: null
    };
  }

  componentWillMount() {

  }

  componentDidMount() {

  }

  componentWillUnmount() {

  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      values: nextProps.values
    });

    // Generalte an array with date, income outcome value

    if (nextProps.values) {
      let rootNode = ReactDOM.findDOMNode(this).parentNode;
      let margin = {top: 20, right: 50, bottom: 30, left: 50},
          width = +rootNode.offsetWidth - 1 - margin.left - margin.right,
          height = +rootNode.offsetHeight - 1 - margin.top - margin.bottom - 20;

      this.setState({
        rootNode: rootNode
      });

      let svg = d3.select(rootNode).append('svg');

      let g = svg.attr('width', width + margin.left + margin.bottom)
        .attr('height', height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      let x = d3.scaleTime()
          .rangeRound([0, width]);

      let y = d3.scaleLinear()
          .rangeRound([height, 0]);

      let line = d3.line()
          .x(function(d) { return x(d.date); })
          .y(function(d) { return y(d.value); });


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

      x.domain(d3.extent(dataIncome, function(d) { return new Date(d.date); }));
      y.domain(d3.extent(dataIncome.concat(dataExpenses), function(d) { return d.value }));

      g.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x))
        .select(".domain")
          .remove();

      g.append("g")
        .call(d3.axisLeft(y))
      .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Price");

      g.append("path")
        .datum(dataIncome)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 2)
        .attr("d", line);

      g.append("path")
        .datum(dataExpenses)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 2)
        .attr("d", line);

      var focus = svg.append("g")
          .attr("class", "focus")
          .style("display", "none");

      focus.append("circle")
          .attr("fill", "steelblue")
          .attr("r", 4.5);

      focus.append("text")
          .attr("fill", "black")
          .attr("x", 9)
          .attr("dy", ".35em");

      var focusExpenses = svg.append("g")
          .attr("class", "focus")
          .style("display", "none");

      focusExpenses.append("circle")
          .attr("fill", "red")
          .attr("r", 4.5);

      focusExpenses.append("text")
          .attr("fill", "black")
          .attr("x", 9)
          .attr("dy", ".35em");

      svg.append("rect")
          .attr("class", "overlay")
          .attr("fill", "none")
          .attr("pointer-events", "all")
          .attr("width", width)
          .attr("height", height)
          .on("mouseover", function() { focus.style("display", null); focusExpenses.style("display", null); })
          .on("mouseout", function() { focus.style("display", "none"); focusExpenses.style("display", "none"); })
          .on("mousemove", mousemove);

      function mousemove() {
        var x0 = x.invert(d3.mouse(this)[0]);
        var d = new Date(x0.getFullYear(), x0.getMonth());
        var data = dataIncome.find((item) => { return item.date.getTime() === d.getTime()});

        focus.attr("transform", "translate(" + (x(data.date) + margin.left) + "," + (y(data.value) + margin.top) + ")");
        focus.select("text").text(CurrencyStore.format(data.value));

        var data2 = dataExpenses.find((item) => { return item.date.getTime() === d.getTime()});

        focusExpenses.attr("transform", "translate(" + (x(data2.date) + margin.left) + "," + (y(data2.value) + margin.top) + ")");
        focusExpenses.select("text").text(CurrencyStore.format(data2.value));

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
