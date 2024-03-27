/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import * as d3 from "d3";
import { useEffect, useState } from "react";
import { useD3 } from "../../hooks/useD3";

const LOADING_VALUES = [
  { expenses: 30 },
  { expenses: 20 },
  { expenses: 10 },
  { expenses: 31 },
];
const LOADING_COLORS = d3.scaleOrdinal([
  "#EEEEEE",
  "#E0E0E0",
  "#BDBDBD",
  "#E8E8E8",
]);

const MARGIN = { top: 0, right: 0, bottom: 0, left: 0 };

const COLORS = d3.scaleOrdinal(["#C5CAE9", "#9FA8DA", "#7986CB", "#5C6BC0"]);

export default function PieGraph({
  values,
  isLoading = false,
  ratio = "100%",
}) {
  // SVG markup
  let width = null;
  let height = null;

  const [animateLoading, setAnimateLoading] = useState(Boolean(isLoading));
  const [array, setArray] = useState(values || []);
  const [timer] = useState([]);

  const resizeObserver = new ResizeObserver((entries) => {
    // eslint-disable-next-line no-empty-pattern
    for (const {} of entries) {
      for (let i = 0; i < timer.length; i++) {
        clearTimeout(timer.pop());
      }
      timer.push(
        setTimeout(() => {
          if (myRef.current) {
            draw(d3.select(myRef.current));
          }
        }, 50)
      );
    }
  });

  // Points to display on hover effect
  let myRef = useD3(
    (refCurrent) => {
      try {
        if (array && array.length) {
          // Initialize graph
          refCurrent
            .attr("preserveAspectRatio", "xMinYMin meet") //.attr("viewBox", "0 0 600 400")
            .classed("svg-content-responsive", true);
          // If values are passed as parameter, we draw.
          if (refCurrent && refCurrent.offsetWidth === 0) {
            setTimeout(() => draw(refCurrent), 200);
          } else {
            draw(refCurrent);
          }
        } else {
          refCurrent.selectAll("g").remove();
        }

        // Listen at parent size Change
        resizeObserver.observe(myRef?.current?.parentNode);
      } catch (error) {
        console.error(error);
      }
    },
    [array, animateLoading]
  );

  useEffect(() => {
    if (array.length != values.length) {
      setArray(values);
    } else if (
      !array.every((element, index) => element.id == values[index].id)
    ) {
      setArray(values);
    }
  }, [values]);

  useEffect(() => {
    setAnimateLoading(isLoading);
  }, [isLoading]);

  const draw = (_svg) => {
    if (!_svg) {
      return;
    }

    _svg.selectAll("g").remove();

    width = +_svg._groups[0][0].clientWidth - MARGIN.left - MARGIN.right;
    height = +_svg._groups[0][0].clientHeight - MARGIN.top - MARGIN.bottom;

    const radius = Math.min(width, height) / 2;

    if (height > width) {
      // to keep ratio 1/1
      width = height;
    }

    let localGraph = _svg
      .attr("viewBox", `0 0 ${width} ${height + MARGIN.top + MARGIN.bottom}`)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    const pie = d3
      .pie()
      .sort(null)
      .value(function (d) {
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
      .data(pie(animateLoading ? LOADING_VALUES : array))
      .enter()
      .append("g")
      .attr("class", "arc");

    arc
      .append("path")
      .attr("d", path)
      .attr("fill", function (d) {
        return animateLoading
          ? LOADING_COLORS(d.data.expenses)
          : COLORS(d.data.expenses);
      });

    arc
      .append("text")
      .attr("transform", function (d) {
        return "translate(" + label.centroid(d) + ")";
      })
      .attr("dy", "0.35em")
      .text(function (d) {
        return d.data ? d.data.name : "";
      });
  };

  return <svg ref={myRef} style={{ width: "100%", height: "100%" }}></svg>;
}
