import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import * as d3 from "d3";

export default function LineGraph({ values }) {
  let myRef = useRef();
  // DOM element
  let element = null;
  let parent;

  // SVG markup
  let width = null;
  let height = null;
  let margin = { top: 5, right: 5, bottom: 5, left: 5 };

  // Axes from graph
  let x = null;
  let y = null;

  // Points to display on hover effect
  const [svg, setSvg] = useState(null);
  const [graph, setGraph] = useState(null);
  // Move event function
  let onMouseMove = null;

  useEffect(() => {
    let localSVG = svg;

    if (localSVG == null) {
      // Initialize graph
      localSVG = d3
        .select(myRef.current)
        .append("div")
        .classed("svg-container", true) //container class to make it responsive
        .style("padding-bottom", "60px")
        .append("svg")
        .classed("svg-content-responsive", true);
      setSvg(localSVG);
    }

    if (values) {
      if (myRef.current && myRef.current.offsetWidth === 0) {
        setTimeout(() => draw(localSVG), 200);
      } else {
        draw(localSVG);
      }
    } else {
      if (graph) {
        graph.remove();
      }
    }

    window.addEventListener("optimizedResize", draw, false);
    return () => {
      window.removeEventListener("optimizedResize", draw, false);
    };
  }, [values]);

  const draw = (_svg = svg) => {
    if (!values || !myRef.current) {
      return;
    }

    if (graph) {
      graph.remove();
    }

    // Define width and height based on parent DOM element
    width = +myRef.current.offsetWidth - 1 - margin.left - margin.right;
    height = 50 - margin.top - margin.bottom;

    // Define axes
    x = d3.scaleTime().rangeRound([0, width]);
    y = d3.scaleLinear().rangeRound([height, 0]);

    const line = d3
      .line()
      .x(function(d) {
        return x(d.date);
      })
      .y(function(d) {
        return y(d.value);
      });

    // Define domain
    let array = [];
    values.forEach(line => {
      array = array.concat(line.values);
    });
    x.domain(
      d3.extent(array, function(d) {
        return d.date;
      })
    );

    const range = d3.extent(array, function(d) {
      return d.value;
    });
    y.domain([range[0] * 0.9, range[1] * 1.1]);

    // Draw graph
    const localGraph = _svg
      .attr("viewBox", `0 0 ${width} ${height + margin.top + margin.bottom}`)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Draw lines
    values.forEach(l => {
      localGraph
        .append("path")
        .datum(l.values)
        .attr("fill", "none")
        .attr("stroke", l.color ? l.color : "var(--primary-color)")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 3)
        .attr("d", line);
    });

    setGraph(localGraph);
  };

  return <div ref={myRef}></div>;
}
