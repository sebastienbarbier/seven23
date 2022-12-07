import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import * as d3 from "d3";
import { useD3 } from '../../hooks/useD3';

import { useTheme } from "@mui/styles";

const COLORS = d3.scaleOrdinal(["#C5CAE9", "#9FA8DA", "#7986CB", "#5C6BC0"]);

export default function CalendarGraph({ values, isLoading, color="#5C6BC0", weeksNumber=52, quantile=0.90 }) {

  const theme = useTheme();

  let myRef = useD3(
    (refCurrent) => {

      if (values) {
        if (myRef.current && myRef.current.offsetWidth === 0) {
          setTimeout(() => draw(refCurrent), 200);
        } else {
          draw(refCurrent);
        }
      } else {
        _svg.selectAll("g").remove();
      }

      window.addEventListener("optimizedResize", ()=> draw(refCurrent), false);
      return () => {
        window.removeEventListener("optimizedResize", ()=> draw(refCurrent), false);
      };
    },
    [values]
  );

  const draw = (_svg) => {
    // Somehow call calendar
    _svg.selectAll("g").remove();
    if (values) {
      Calendar(_svg, values, {
        x: value => value.date,
        y: value => value.amount,
        width: +_svg._groups[0][0].clientWidth,
        cellSize: 52 * 10 / weeksNumber, // if 52 then 10.
        colors: d3.interpolateRgb(d3.color(`${color}`), d3.color(`${color}10`))
      });
    }
  };

  // Copyright 2021 Observable, Inc.
  // Released under the ISC license.
  // https://observablehq.com/@d3/calendar-view
  function Calendar(_svg, data, {
    x = ([x]) => x, // given d in data, returns the (temporal) x-value
    y = ([, y]) => y, // given d in data, returns the (quantitative) y-value
    title, // given d in data, returns the title text
    width = 925, // width of the chart, in pixels
    cellSize = 17, // width and height of an individual day, in pixels
    weekday = "monday", // either: weekday, sunday, or monday
    formatDay = i => "SMTWTFS"[i], // given a day number in [0, 6], the day-of-week label
    formatMonth = "%b", // format specifier string for months (above the chart)
    yFormat, // format specifier string for values (in the title)
    colors = d3.interpolatePiYG
  } = {}) {

    // Compute values.
    const X = d3.map(data, x);
    const Y = d3.map(data, y);
    const I = d3.range(X.length);

    const countDay = weekday === "sunday" ? i => i : i => (i + 6) % 7;
    const timeWeek = weekday === "sunday" ? d3.utcSunday : d3.utcMonday;
    const weekDays = weekday === "weekday" ? 5 : 7;
    const height = cellSize * (weekDays + 2);

    // Compute a color scale. This assumes a diverging color scheme where the pivot
    // is zero, and we want symmetric difference around zero.
    const max = d3.quantile(Y, quantile, Math.abs);
    const color = d3.scaleSequential([-max, 0], colors).unknown("none");

    // Construct formats.
    formatMonth = d3.utcFormat(formatMonth);

    // Compute titles.
    if (title === undefined) {
      const formatDate = d3.utcFormat("%B %-d, %Y");
      const formatValue = color.tickFormat(100, yFormat);
      title = i => `${formatDate(X[i])}\n${formatValue(Y[i])}`;
    } else if (title !== null) {
      const T = d3.map(data, title);
      title = i => T[i];
    }

    // Group the index by year, in reverse input order. (Assuming that the input is
    // chronological, this will show years in reverse chronological order.)
    const years = d3.groups(I, i => X[i].getUTCFullYear()).reverse();

    function pathMonth(t) {
      const d = Math.max(0, Math.min(weekDays, countDay(t.getUTCDay())));
      const w = timeWeek.count(d3.utcYear(t), t);
      return `${d === 0 ? `M${w * cellSize},0`
          : d === weekDays ? `M${(w + 1) * cellSize},0`
          : `M${(w + 1) * cellSize},0V${d * cellSize}H${w * cellSize}`}V${weekDays * cellSize}`;
    }

    const svg = _svg //d3.create("svg")
        .attr("width", width)
        .attr("height", height * years.length)
        .attr("viewBox", [0, 0, width, height * years.length])
        .attr("style", "max-width: 100%; min-width: 100%; height: auto; height: intrinsic;")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10);

    const year = svg.selectAll("g")
      .data(years)
      .join("g")
        .attr("transform", (d, i) => `translate(40.5,${height * i + cellSize * 1.5})`);

    year.append("text")
        .attr("x", -5)
        .attr("y", -5)
        .attr("font-weight", "bold")
        .attr("text-anchor", "end")
        .attr("fill", i => d3.color(theme.palette.text.primary))
        .text(([key]) => key);

    year.append("g")
        .attr("text-anchor", "end")
      .selectAll("text")
      .data(weekday === "weekday" ? d3.range(1, 6) : d3.range(7))
      .join("text")
        .attr("x", -5)
        .attr("y", i => (countDay(i) + 0.5) * cellSize)
        .attr("dy", "0.31em")
        .text(formatDay)
        .attr("fill", i => d3.color(theme.palette.text.primary));

    const cell = year.append("g")
      .selectAll("rect")
      .data(weekday === "weekday"
          ? ([, I]) => I.filter(i => ![0, 6].includes(X[i].getUTCDay()))
          : ([, I]) => I)
      .join("rect")
        .attr("width", cellSize - 1)
        .attr("height", cellSize - 1)
        .attr("x", i => timeWeek.count(d3.utcYear(X[i]), X[i]) * cellSize + 0.5)
        .attr("y", i => countDay(X[i].getUTCDay()) * cellSize + 0.5)
        .attr("fill", i => color(Y[i]));

    if (title) cell.append("title")
        .text(title);

    const month = year.append("g")
      .selectAll("g")
      .data(([, I]) => d3.utcMonths(d3.utcMonth(X[I[0]]), X[I[I.length - 1]]))
      .join("g");

    // Display large line between month to show separation
    month.filter((d, i) => i).append("path")
        .attr("fill", "none")
        .attr("stroke", d3.color(theme.palette.background.default)) // "#fff"
        .attr("stroke-width", 3)
        .attr("d", pathMonth);

    // Write month in header (janv, feb, march, ...)
    month.append("text")
        .attr("x", d => timeWeek.count(d3.utcYear(d), timeWeek.ceil(d)) * cellSize + 2)
        .attr("y", -5)
        .text(formatMonth)
        .attr("fill", i => d3.color(theme.palette.text.primary));

    return Object.assign(svg.node(), {scales: {color}});
  }

  return (
    <svg ref={myRef} style={{ width: '100%'}}></svg>
  );
}
