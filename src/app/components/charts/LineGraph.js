import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import * as d3 from "d3";
import { useD3 } from '../../hooks/useD3';

let MARGIN = { top: 5, right: 5, bottom: 5, left: 5 };

export default function LineGraph({ values }) {

  let myRef = useD3(
    (refCurrent) => {

      refCurrent.classed("svg-content-responsive", true);

      if (values && values.length && values[0].values) {
        if (myRef.current && myRef.current.offsetWidth === 0) {
          setTimeout(() => draw(refCurrent), 200);
        } else {
          draw(refCurrent);
        }
      }

      window.addEventListener("optimizedResize", ()=> draw(refCurrent), false);
      return () => {
        window.removeEventListener("optimizedResize", ()=> draw(refCurrent), false);
      };
    },
    [values]
  );

  const draw = (_svg) => {

    _svg.selectAll("g").remove();

    // Define width and height based on parent DOM element
    const width = +_svg._groups[0][0].clientWidth - 1 - MARGIN.left - MARGIN.right;
    const height = 50 - MARGIN.top - MARGIN.bottom;

    // Define axes
    const x = d3.scaleTime().rangeRound([0, width]);
    const y = d3.scaleLinear().rangeRound([height, 0]);

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
      .attr("viewBox", `0 0 ${width} ${height + MARGIN.top + MARGIN.bottom}`)
      .append("g")
      .attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")");

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
  };

  return (
    <svg ref={myRef} style={{ width: '100%'}}></svg>
  );
}
