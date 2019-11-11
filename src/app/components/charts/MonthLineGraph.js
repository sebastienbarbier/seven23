/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useState, useEffect, useRef } from "react";
import moment from "moment";
import * as d3 from "d3";

export default function MonthLineGraph({
  values,
  isLoading = false,
  ratio = "50%",
  color
}) {
  let myRef = useRef();
  // DOM element
  let parent;

  // SVG markup
  let width = null;
  let height = null;
  let margin = { top: 20, right: 50, bottom: 16, left: 50 };

  const animationDuration = 4000;
  const [animation, setAnimation] = useState(null);

  // Axes from graph
  let x = null;
  let y = null;

  // Points to display on hover effect
  const [svg, setSvg] = useState(null);
  const [graph, setGraph] = useState(null);
  const [line, setLine] = useState(null);
  // Move event function
  let onMouseMove = null;

  useEffect(() => {
    let localSVG = svg;
    let timer = null;

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
    }

    if (values) {
      if (myRef.current && myRef.current.offsetWidth === 0) {
        timer = setTimeout(() => draw(localSVG), 200);
      } else {
        draw(localSVG);
      }
    } else {
      if (graph) {
        graph.remove();
      }
    }

    setSvg(localSVG);
    window.addEventListener("optimizedResize", draw, false);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("optimizedResize", draw, false);
    };
  }, [values, isLoading]);

  const generateLoadingValues = () => {
    let res = [];
    for (let i = 0; i < 10; i++) {
      res.push({
        date: moment()
          .subtract(i, "month")
          .toDate(),
        value: Math.random()
      });
    }
    return res;
  };

  const draw = (_svg = svg) => {
    // Remove points from previous graph
    if (values && values.length) {
      values.forEach(_line => {
        if (_line.point) {
          _line.point.remove();
        }
      });
    }
    // Remove graph
    if (graph) {
      graph.remove();
    }

    // If we display loading animation
    if (isLoading) {
      values = [
        {
          color: "#E0E0E0",
          values: generateLoadingValues()
        },
        {
          color: "#BDBDBD",
          values: generateLoadingValues()
        }
      ];
    }

    // Define domain
    let array = [];
    values.forEach(_line => {
      array = array.concat(_line.values);
    });

    // Define width and height based on parent DOM element
    width = +myRef.current.offsetWidth - margin.left - margin.right;
    height =
      +width / (100 / parseInt(ratio.replace("%", ""))) -
      margin.top -
      margin.bottom;

    // Define axes
    x = d3.scaleTime().rangeRound([0, width - margin.right]);
    y = d3.scaleLinear().rangeRound([height - margin.bottom, 0]);

    x.domain(
      d3.extent(array, function(d) {
        return d.date;
      })
    );
    y.domain([
      0,
      d3.max(array, function(d) {
        return d.value;
      }) * 1.1
    ]);

    const localLine = d3
      .line()
      .x(function(d) {
        return x(d.date);
      })
      .y(function(d) {
        return y(d.value);
      });

    if (_svg && _svg.attr) {
      // Draw graph
      const localGraph = _svg
        .attr(
          "viewBox",
          `0 0 ${width + margin.right} ${height + margin.top + margin.bottom}`
        )
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Draw axes with defined domain
      const xaxis = localGraph
        .append("g")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(d3.axisBottom(x));

      xaxis
        .select(".domain")
        .attr("stroke", color)
        .remove();

      xaxis.selectAll("line").attr("stroke", color);
      xaxis.selectAll("text").attr("fill", color);

      const yaxis = localGraph
        .append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y));

      yaxis.select(".domain").attr("stroke", color);

      yaxis.selectAll("line").attr("stroke", color);
      yaxis.selectAll("text").attr("fill", color);

      yaxis
        .append("text")
        .attr("fill", color)
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Price");

      // Draw lines
      values.forEach(_line => {
        // Draw line
        _line.line = localGraph
          .append("path")
          .datum(_line.values)
          .attr("class", "line")
          .attr("fill", "none")
          .attr("stroke", _line.color ? _line.color : "var(--primary-color)")
          .attr("stroke-linejoin", "round")
          .attr("stroke-linecap", "round")
          .attr("stroke-width", 2)
          .attr("d", localLine);

        // Draw point
        _line.point = _svg
          .append("g")
          .attr("class", "focus")
          .style("display", "none");

        _line.point
          .append("circle")
          .attr("fill", _line.color ? _line.color : "var(--primary-color)")
          .attr("r", 4.5);

        _line.point
          .append("text")
          .attr("fill", color)
          .attr("x", 9)
          .attr("dy", ".35em");
      });

      // If loading, we start the animation
      if (isLoading) {
        const animate = () => {
          if (myRef && myRef.current) {
            values.forEach(_line => {
              _line.line.datum(generateLoadingValues());
            });
            var t0 = localGraph.transition().duration(animationDuration);
            t0.selectAll(".line").attr("d", localLine);
            setAnimation(setTimeout(animate, animationDuration));
          }
        };
        animate();
      } else if (animation) {
        clearTimeout(animation);
      }

      // If not loading, we initialize click and mouse event
      if (!isLoading) {
        // Hover zone
        _svg
          .append("rect")
          .attr("class", "overlay")
          .attr("fill", "none")
          .attr("pointer-events", "all")
          .attr("width", width)
          .attr("height", height)
          .style("cursor", !isLoading ? "pointer" : "default")
          .on("mouseover", function() {
            values.forEach(_line => {
              _line.point.style("display", null);
            });
          })
          .on("mouseout", function() {
            values.forEach(_line => {
              _line.point.style("display", "none");
            });
          })
          .on("touchmove", onMouseMove)
          .on("mousemove", onMouseMove);
      }

      setGraph(localGraph);
    }

    function onMouseMove() {
      // var x0 = x.invert(d3.mouse(this)[0]);
      // var d = new Date(x0.getFullYear(), x0.getMonth());

      var x0 = moment(x.invert(d3.mouse(this)[0] - margin.left));
      if (x0.date() >= 15) {
        x0.add(15, "day");
      }
      const d = new Date(x0.year(), x0.month());

      values.forEach(_line => {
        var data = _line.values.find(item => {
          return item.date.getTime() === d.getTime();
        });
        if (data && data.value) {
          _line.point.style("display", null);
          _line.point.attr(
            "transform",
            "translate(" +
              (x(data.date) + margin.left) +
              "," +
              (y(data.value) + margin.top) +
              ")"
          );
          _line.point.select("text").text(data.value.toFixed(2));
        } else {
          _line.point.style("display", "none");
        }
      });
    }
  };

  return <div ref={myRef}></div>;
}
