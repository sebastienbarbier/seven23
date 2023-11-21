/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import moment from "moment";
import * as d3 from "d3";
import { useD3 } from '../../hooks/useD3';

import { amountWithCurrencyToString } from "../../utils/currency";

const ANIMATION_DURATION = 4000;
const MARGIN = { top: 0, right: 10, bottom: 20, left: 10 };
// const MARGIN = { top: 0, right: 0, bottom: 0, left: 0 };

// On loading we generate random data for the skeleton animation
const generateLoadingValues = () => {
  let res = [];
  for (let i = 0; i < 10; i++) {
    res.push({
      date: moment().subtract(i, "month").toDate(),
      value: Math.random(),
    });
  }
  return res;
};

export default function MonthLineGraph({
  values,
  isLoading = false,
  color,
}) {
  // Size width and height for SVG markup
  let width = null;
  let height = null;
  // Store access to the timeOut for removal
  const [animation, setAnimation] = useState(null);
  // Currency to deplay on y-axe the currency code
  const selectedCurrency = useSelector((state) =>
    state.currencies.find((c) => c.id == state.account.currency)
  );
  // Trigger animation
  const [animateLoading, setAnimateLoading] = useState(Boolean(isLoading));
  const [array, setArray] = useState(values || []);
  // Store SetTimeout to cancel if needed
  const [timer] = useState([]);

  const [listeners, setListeners] = useState([]);

  // Axes from graph
  let x = null;
  let y = null;

  const optimizedResize = () => {
    for (let i = 0; i< timer.length; i++) {
      clearTimeout(timer.pop());
    }

    timer.push(setTimeout(() => {
      draw(d3.select(myRef.current));
    }, 50));
  };

  let myRef = useD3(
    (refCurrent) => {
      try {
        let timer = null;
        if (array) {
          refCurrent?.attr("preserveAspectRatio", "xMinYMin meet")?.classed("svg-content-responsive", true);

          if (refCurrent && refCurrent.offsetWidth === 0) {
            timer = setTimeout(() => draw(refCurrent), 200);
          } else {
            draw(refCurrent);
          }
        }
      } catch (error) {
        console.error(error);
      }

      for (let i = 0; i< listeners.length; i++) {
        window.removeEventListener("optimizedResize", listeners[i], false);
      }
      listeners.push(optimizedResize);
      window.addEventListener("optimizedResize", optimizedResize);
    },
    [array, animateLoading]
  );

  useEffect(() => {
    return () => {
      for (let i = 0; i< listeners.length; i++) {
        window.removeEventListener("optimizedResize", listeners[i], false);
      }
    };
  }, []);

  useEffect(() => {
    if (values && array && array.length != values.length) {
      setArray(values);
    } else if (values && array && values[0]?.values.length != array[0]?.values.length) {
      setArray(values);
    } else if (values && array && values[1]?.values.length != array[1]?.values.length) {
      setArray(values);
    } else if (values && array && !values[0]?.values?.every((element, index) => element.date == array[0]?.values[index]?.date)) {
      setArray(values);
    } else if (values && array && !values[1]?.values?.every((element, index) => element.date == array[1]?.values[index]?.date)) {
      setArray(values);
    }
  }, [values]);

  useEffect(() => {
    setAnimateLoading(isLoading);
  }, [isLoading]);

  const draw = (_svg) => {
    // Remove content from svg to draw again
    _svg.selectAll("g").remove();

    // Remove points from previous graph
    if (values && values.length) {
      values.forEach((_line) => {
        if (_line.point) {
          _line.point.remove();
        }
      });
    }

    // If we display loading animation
    if (animateLoading) {
      values = [
        {
          color: "#E0E0E0",
          values: generateLoadingValues(),
        },
        {
          color: "#BDBDBD",
          values: generateLoadingValues(),
        },
      ];
    }

    // Define domain
    let array = [];
    values.forEach((_line) => {
      array = array.concat(_line.values);
    });

    // Define width and height based on parent DOM element
    width = +_svg._groups[0][0]?.parentNode.clientWidth;
    height = +_svg._groups[0][0]?.parentNode.clientHeight;

    // Define axes
    x = d3.scaleTime().rangeRound([0, width - MARGIN.right - MARGIN.left]); // width px
    y = d3.scaleLinear().rangeRound([height - MARGIN.bottom - MARGIN.top,  12]);

    x.domain(
      d3.extent(array, function (d) {
        return d.date;
      })
    );

    var min = d3.min(array, function (d) {
      return d.value;
    });
    var max = d3.max(array, function (d) {
      return d.value;
    });

    // Add 20% of max-min value before and after with min 0
    y.domain([
      d3.max([0, min - ((max - min) / 5)]),
      max + ((max - min) / 5),
    ]);

    const localLine = d3
      .line()
      .x(function (d) {
        return x(d.date);
      })
      .y(function (d) {
        return y(d.value);
      });

    if (_svg && _svg.attr) {

      // Draw graph
      const localGraph = _svg
        .attr(
          "viewBox",
          `0 0 ${width} ${height}` // viewport size based on parentNode div
        )
        .append("g")
        .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`); // Translate graph to display labels

      // Draw xaxis with defined domain
      const xaxis = localGraph
        .append("g")
        .attr("transform", `translate(0,${height - MARGIN.top - MARGIN.bottom})`) // Display x graph with values
        .call(d3.axisBottom(x));

      // Remove first and last text from xaxis
      xaxis.selectAll("text").each(function(_, i, nodes) {
        if (i === 0) {
          d3.select(nodes[i]).remove();
        }
        if (i === nodes.length - 1) {
          d3.select(nodes[i]).remove();
        }
      });
      xaxis.selectAll("line").each(function(_, i, nodes) {
        if (i === 0) {
          d3.select(nodes[i]).remove();
        }
        if (i === nodes.length - 1) {
          d3.select(nodes[i]).remove();
        }
      });
      // remove xaxis line
      xaxis.select(".domain").attr("stroke", color).remove();
      // Make xaxis legend lighter color using opacity
      xaxis.selectAll("line").attr("stroke", color).attr("opacity", 0.8);
      xaxis.selectAll("text").attr("fill", color).attr("opacity", 0.8);

      // Custom xaxis UI with stroked line
      _svg.append("g")
        .attr("transform", `translate(${MARGIN.left}, 0)`)
        .call(d3.axisRight(y)
            .tickSize(width - MARGIN.left - MARGIN.right))
        .call(g => g.select(".domain")
            .remove())
        .call(g => g.selectAll(".tick line")
            .attr("stroke-opacity", 0.2)
            .attr("stroke-dasharray", "2,2"))
        // Move text
        .call(g => g.selectAll(".tick text")
            .attr("opacity", 0.4)
            .attr("x", 4)
            .attr("dy", -4));

      // Draw lines with points inside xaxis and yaxis
      values.forEach((_line) => {

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

        // Draw transparent circle to hide line when mouse is not hover
        localGraph
          .append("g")
          .selectAll("dot")
          .data(_line.values)
          .enter()
          .append("circle")
              .attr("cx", function(d) { return x(d.date) } )
              .attr("cy", function(d) { return y(d.value) } )
              .attr("r", _line.values.length > 12 ? 2.5 : 4)
              .attr("fill", "var(--paper-color)")

        // Draw circle with color
        localGraph
          .append("g")
          .selectAll("dot")
          .data(_line.values)
          .enter()
          .append("circle")
            .attr("cx", function(d) { return x(d.date) } )
            .attr("cy", function(d) { return y(d.value) } )
            .attr("r", _line.values.length > 12 ? 1.5 : 2.5)
            .attr("fill", _line.color ? _line.color : "var(--primary-color)")
      });

      // Handle mouse over effect

      // This allows to find the closest X index of the mouse:
      var bisect = d3.bisector(function(d) { return d.date; }).left;

      // Trace line on overlayed date
      const focus = _svg
        .append("line")
        .attr("y1", 0)
        .attr("y2", height - MARGIN.bottom - MARGIN.top)
        .style("opacity", 0)
        .style("transition", "opacity 200ms")
        .attr("stroke", "rgba(0, 0, 0, 0.3)")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-dasharray", "2,2")
        .attr("stroke-width", 1);

        // Display Focus Text
      var focusText = _svg
        .append('g')
        .append('text')
          .style("opacity", 0)
          .attr("text-anchor", "left")
          .attr("alignment-baseline", "middle")

      // Overide default SVG behavior to display tooltip
      _svg
        .append('rect')
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr('width', width)
        .attr('height', height)
        .on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseout', mouseout);

      // What happens when the mouse move -> show the annotations at the right positions.
      function mouseover() {
        focus.style("opacity", 1)
        focusText.style("opacity",1)
      }

      function mousemove() {
        // recover coordinate we need
        var cursorX = d3.pointer(event)[0];
        if (values[0]) {

          var xvalues = values[0].values;

          var x0 = x.invert(cursorX);
          var i = bisect(xvalues, x0, 1);

          var nextPosition = i < xvalues.length ? xvalues[i] : xvalues[i-1];
          var previousPosition = xvalues[i-1];

          var selectedData = nextPosition;

          if (cursorX - x(previousPosition.date) <  x(nextPosition.date) - cursorX) {
            selectedData = previousPosition;
          }

          // Position focus ring
          focus
            .attr("x1", x(selectedData.date) + MARGIN.left)
            .attr("x2", x(selectedData.date) + MARGIN.left);


          // Position focus text
          // focusText
          //   .html(amountWithCurrencyToString(selectedData.value, selectedCurrency))
          //   .attr("x", x(selectedData.date) + MARGIN.left)
          //   .attr("y", y(selectedData.value))
        }
      }
      function mouseout() {
        focus.style("opacity", 0)
        focusText.style("opacity", 0)
      }

      // If loading, we start the animation
      if (animateLoading) {
        // Define sa const for recursive call
        const animate = () => {
          if (myRef && myRef.current) {
            values.forEach((_line) => {
              _line?.line?.datum(generateLoadingValues());
            });
            var t0 = localGraph.transition().duration(ANIMATION_DURATION);
            t0.selectAll(".line").attr("d", localLine);
            setAnimation(setTimeout(animate, ANIMATION_DURATION));
          }
        };
        animate();
      } else {
        if (animation) {
          clearTimeout(animation);
        }
      }
    }
  };

  return (
    <svg ref={myRef} style={{ width: '100%', height: '100%' }}>
    </svg>
  );
}