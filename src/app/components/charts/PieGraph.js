/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import * as d3 from "d3";

export default function PieGraph({
  values,
  isLoading = false,
  ratio = "100%"
}) {
  let myRef = useRef();
  // DOM element
  let parent;

  // SVG markup
  let width = null;
  let height = null;
  const margin = { top: 50, right: 50, bottom: 50, left: 50 };
  const colors = d3.scaleOrdinal(["#C5CAE9", "#9FA8DA", "#7986CB", "#5C6BC0"]);

  const loadingValues = [
    { expenses: 30 },
    { expenses: 20 },
    { expenses: 10 },
    { expenses: 31 }
  ];
  const loadingColors = d3.scaleOrdinal([
    "#EEEEEE",
    "#E0E0E0",
    "#BDBDBD",
    "#E8E8E8"
  ]);

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
        .style("padding-bottom", ratio)
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet") //.attr("viewBox", "0 0 600 400")
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
  }, [values, isLoading]);

  const draw = (_svg = svg) => {
    if (graph) {
      graph.remove();
    }

    if (isLoading) {
      values = loadingValues;
    }

    width = +myRef.current.offsetWidth - margin.left - margin.right;
    height = +myRef.current.offsetHeight - margin.top - margin.bottom;
    const radius = Math.min(width, height) / 2;

    if (height > width) {
      // to keep ratio 1/1
      width = height;
    }

    const localGraph = _svg
      .attr("viewBox", `0 0 ${width} ${height + margin.top + margin.bottom}`)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    const pie = d3
      .pie()
      .sort(null)
      .value(function(d) {
        return d.expenses > 0 ? d.expenses : d.expenses * -1;
      });

    let path = d3
      .arc()
      .outerRadius(radius - 10)
      .innerRadius(0);

    let label = d3
      .arc()
      .outerRadius(radius - 40)
      .innerRadius(radius - 40);

    let arc = localGraph
      .selectAll(".arc")
      .data(pie(values))
      .enter()
      .append("g")
      .attr("class", "arc");

    arc
      .append("path")
      .attr("d", path)
      .attr("fill", function(d) {
        return isLoading
          ? loadingColors(d.data.expenses)
          : colors(d.data.expenses);
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

    setGraph(localGraph);
  };

  return <div ref={myRef} style={{ width: "100%", height: "100%" }}></div>;
}
