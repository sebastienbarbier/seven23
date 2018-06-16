/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import { Component } from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import * as d3 from 'd3';

import CurrencyStore from '../../stores/CurrencyStore';

class MonthLineGraph extends Component {
  constructor(props) {
    super(props);

    this.values = props.values;

    // DOM element
    this.element = null;
    this.ratio = props.ratio || '50%';
    this.isLoading = props.isLoading || false;
    this.animation = null;
    this.animationDuration = 4000;

    // SVG markup
    this.svg = null;
    this.width = null;
    this.height = null;
    this.margin = { top: 0, right: 50, bottom: 20, left: 50 };

    // Axes from graph
    this.x = null;
    this.y = null;

    // Define line styling
    this.line = null;

    // Points to display on hover effect
    this.graph = null;

    // Move event function
    this.onMouseMove = null;
    this.onClick = props.onClick;
  }

  componentDidMount() {
    // DOM element related ot this document
    this.element = ReactDOM.findDOMNode(this).parentNode;

    // Initialize graph
    this.svg = d3
      .select(this.element)
      .append('div')
      .classed('svg-container', true) //container class to make it responsive
      .style('padding-bottom', this.ratio)
      .append('svg')
      .attr('preserveAspectRatio', 'xMinYMin meet') //.attr("viewBox", "0 0 600 400")
      .classed('svg-content-responsive', true);

    this.draw();
    window.addEventListener('optimizedResize', this.handleResize, false);
  }

  componentWillUnmount() {
    window.removeEventListener('optimizedResize', this.handleResize, false);
  }

  handleResize = () => {
    this.draw();
  };

  // Expect stats to be
  // stats = [
  //  { color: '', values: [{ date: '', value: ''}, {}]},
  //  {}
  // ]
  componentWillReceiveProps(nextProps) {
    // Generalte an array with date, income outcome value
    this.values = nextProps.values || [];

    if (this.isLoading != nextProps.isLoading || this.values.length) {
      this.isLoading = nextProps.isLoading;
      this.draw(nextProps.values);
    } else {
      if (this.graph && !this.values) {
        this.graph.remove();
      }
    }
  }

  generateLoadingValues() {
    let res = [];
    for (let i = 0; i < 10; i++) {
      res.push({
        date: moment()
          .subtract(i, 'month')
          .toDate(),
        value: Math.random(),
      });
    }
    return res;
  }

  draw(values = this.values) {
    // Remove points from previous graph
    if (this.values) {
      this.values.forEach(line => {
        if (line.point) {
          line.point.remove();
        }
      });
    }
    // Remove graph
    if (this.graph) {
      this.graph.remove();
    }

    // If we display loading animation
    if (this.isLoading) {
      values = [
        {
          color: '#E0E0E0',
          values: this.generateLoadingValues(),
        },
        {
          color: '#BDBDBD',
          values: this.generateLoadingValues(),
        },
      ];
    } else {
      this.values = values;
    }

    let that = this;

    // Define domain
    let array = [];
    values.forEach(line => {
      array = array.concat(line.values);
    });

    // Define width and height based on parent DOM element
    this.width =
      +this.element.offsetWidth - this.margin.left - this.margin.right;
    this.height =
      +this.width / (100 / parseInt(this.ratio.replace('%', ''))) -
      this.margin.top -
      this.margin.bottom;

    // Define axes
    this.x = d3.scaleTime().rangeRound([0, this.width - this.margin.right]);
    this.y = d3.scaleLinear().rangeRound([this.height - this.margin.bottom, 0]);

    that.x.domain(
      d3.extent(array, function(d) {
        return d.date;
      }),
    );
    that.y.domain([
      0,
      d3.max(array, function(d) {
        return d.value;
      }) * 1.1,
    ]);

    this.line = d3
      .line()
      .x(function(d) {
        return that.x(d.date);
      })
      .y(function(d) {
        return that.y(d.value);
      });

    // Draw graph
    this.graph = this.svg
      .attr(
        'viewBox',
        `0 0 ${this.width + this.margin.right} ${this.height +
          this.margin.top +
          this.margin.bottom}`,
      )
      .append('g')
      .attr(
        'transform',
        'translate(' + this.margin.left + ',' + this.margin.top + ')',
      );

    // Draw axes with defined domain
    this.graph
      .append('g')
      .attr(
        'transform',
        'translate(0,' + (this.height - this.margin.bottom) + ')',
      )
      .call(d3.axisBottom(this.x))
      .select('.domain')
      .remove();

    const yaxis = this.graph
      .append('g')
      .attr('class', 'y axis')
      .call(d3.axisLeft(this.y));

    if (that.isLoading) {
      yaxis.select('.domain').attr('stroke', '#AAA');
    }

    yaxis
      .append('text')
      .attr('fill', this.isLoading ? '#AAA' : '#000')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '0.71em')
      .attr('text-anchor', 'end')
      .text('Price');

    // Draw lines
    values.forEach(line => {
      // Draw line
      line.line = that.graph
        .append('path')
        .datum(line.values)
        .attr('class', 'line')
        .attr('fill', 'none')
        .attr('stroke', line.color ? line.color : 'var(--primary-color)')
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('stroke-width', 2)
        .attr('d', that.line);

      // Draw point
      line.point = this.svg
        .append('g')
        .attr('class', 'focus')
        .style('display', 'none');

      line.point
        .append('circle')
        .attr('fill', line.color ? line.color : 'var(--primary-color)')
        .attr('r', 4.5);

      line.point
        .append('text')
        .attr('fill', 'black')
        .attr('x', 9)
        .attr('dy', '.35em');
    });

    // If loading, we start the animation
    if (this.isLoading) {
      const animate = () => {
        values.forEach(line => {
          line.line.datum(that.generateLoadingValues());
        });
        var t0 = that.graph.transition().duration(that.animationDuration);
        t0.selectAll('.line').attr('d', that.line);
        that.animation = setTimeout(animate, that.animationDuration);
      };
      animate();
    } else if (this.animation) {
      clearTimeout(this.animation);
    }

    // If not loading, we initialize click and mouse event
    if (!this.isLoading) {
      // Hover zone
      this.svg
        .append('rect')
        .attr('class', 'overlay')
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .attr('width', this.width)
        .attr('height', this.height)
        .style(
          'cursor',
          that.onClick && !that.isLoading ? 'pointer' : 'default',
        )
        .on('mouseover', function() {
          values.forEach(line => {
            line.point.style('display', null);
          });
        })
        .on('mouseout', function() {
          values.forEach(line => {
            line.point.style('display', 'none');
          });
        })
        .on('touchmove', onMouseMove)
        .on('mousemove', onMouseMove)
        .on('click', onClick);
    }

    function onClick() {
      if (that.onClick) {
        var x0 = moment(that.x.invert(d3.mouse(this)[0] - that.margin.left));
        if (x0.date() >= 15) {
          x0.add(15, 'day');
        }
        that.onClick(new Date(x0.year(), x0.month()));
      }
    }

    function onMouseMove() {
      // var x0 = that.x.invert(d3.mouse(this)[0]);
      // var d = new Date(x0.getFullYear(), x0.getMonth());

      var x0 = moment(that.x.invert(d3.mouse(this)[0] - that.margin.left));
      if (x0.date() >= 15) {
        x0.add(15, 'day');
      }
      const d = new Date(x0.year(), x0.month());

      values.forEach(line => {
        var data = line.values.find(item => {
          return item.date.getTime() === d.getTime();
        });
        if (data && data.value) {
          line.point.style('display', null);
          line.point.attr(
            'transform',
            'translate(' +
              (that.x(data.date) + that.margin.left) +
              ',' +
              (that.y(data.value) + that.margin.top) +
              ')',
          );
          line.point.select('text').text(CurrencyStore.format(data.value));
        } else {
          line.point.style('display', 'none');
        }
      });
    }
  }

  render() {
    return '';
  }
}

export default MonthLineGraph;
