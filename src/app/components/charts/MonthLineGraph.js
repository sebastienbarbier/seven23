/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import moment from "moment";
import * as d3 from "d3";
import { useD3 } from '../../hooks/useD3';

const ANIMATION_DURATION = 4000;
const MARGIN = { top: 20, right: 50, bottom: 16, left: 50 };

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
  ratio = "50%",
  color,
}) {
  // SVG markup
  let width = null;
  let height = null;

  // Store access to the timeOut for removal
  const [animation, setAnimation] = useState(null);

  const selectedCurrency = useSelector((state) =>
    state.currencies.find((c) => c.id == state.account.currency)
  );

  const [animateLoading, setAnimateLoading] = useState(Boolean(isLoading));
  const [array, setArray] = useState(values || []);
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
          refCurrent
            .attr("preserveAspectRatio", "xMinYMin meet")
            .classed("svg-content-responsive", true);

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
    width = +_svg._groups[0][0]?.clientWidth - MARGIN.left - MARGIN.right;
    height =
      +width / (100 / parseInt(ratio.replace("%", ""))) -
      MARGIN.top -
      MARGIN.bottom;

    // Define axes
    x = d3.scaleTime().rangeRound([0, width - MARGIN.right]);
    y = d3.scaleLinear().rangeRound([height - MARGIN.bottom, 0]);

    x.domain(
      d3.extent(array, function (d) {
        return d.date;
      })
    );

    y.domain([
      0,
      d3.max(array, function (d) {
        return d.value;
      }) * 1.1,
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
          `0 0 ${width + MARGIN.right} ${height + MARGIN.top + MARGIN.bottom}`
        )
        .append("g")
        .attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")");

      // Draw axes with defined domain
      const xaxis = localGraph
        .append("g")
        .attr("transform", "translate(0," + (height - MARGIN.bottom) + ")")
        .call(d3.axisBottom(x));

      xaxis.select(".domain").attr("stroke", color).remove();

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
        .text(selectedCurrency.code);

      // Draw lines
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
      if (animateLoading) {
        // Define sa const for recursive call
        const animate = () => {
          if (myRef && myRef.current) {
            values.forEach((_line) => {
              _line.line.datum(generateLoadingValues());
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
    <svg ref={myRef} style={{ width: '100%', position: 'relative' }}>
    </svg>
  );
}