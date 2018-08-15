import React from 'react';
import { withContentRect } from 'react-measure'
import * as d3 from 'd3';

import PoincareTiling from '../construction/poincareTiling';
import PoincareGeodesic from '../construction/PoincareGeodesic';

class Poincare extends React.Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
    this.tiling = new PoincareTiling({ p: 5, q: 4, depth: 2, radius: 0.269 });
  }
  componentDidMount() {
    this._render();
  }
  componentDidUpdate() {
    this._render();
  }
  render() {
    const { measureRef } = this.props;
    const { width, height } = this._dimensions();
    return (
      <div ref={measureRef} style={{width: '100%', height: '100%'}}>
        <canvas width={width} height={height} ref={node => this.canvasRef = node} />
      </div>
    );
  }
  _dimensions() {
    const { contentRect } = this.props;
    const { width } = contentRect.bounds;
    const height = 800;
    return { width, height };
  }
  _render() {
    const { width, height } = this._dimensions();
    const R = Math.min(width, height) / 2;
    const canvas = d3.select(this.canvasRef);
    
    // update dims
    canvas
      .attr('width', width)
      .attr('height', height)
      // .style('width', `${width}px`)
      // .style('height', `${height}px`);

    // get context
    const context = canvas.node().getContext("2d");
    if (!context) {
      return;
    }

    context.translate(0.5, 0.5);

    context.fillStyle = "white";
    context.strokeStyle = "black";

    // ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);
    // ctx.translate(10 + j * 50, 10 + i * 50);

    context.fillRect(0, 0, width, height);

    context.translate(width / 2, height / 2);
    context.save();

    // boundary circle
    context.beginPath();
    context.arc(0, 0, R, 0, Math.PI * 2, true);
    context.closePath();
    context.stroke();

    // generate polygons
    const polygons = this.tiling.polygons();

    // // DEBUG
    // polygons.sort(function(a, b){
    //   if (a.p !== b.p) {
    //     return a.p-b.p;
    //   } else {
    //     return a.q-b.q;
    //   }
    // });

    // render polygons
    polygons.forEach(polygon => {
      // // DEBUG
      // console.log(polygon.p, polygon.q, polygon._centre);

      // render polygon points
      context.fillStyle = randomColor();
      polygon._points.forEach(point => {
        context.beginPath();
        context.arc(point.re * R, point.im * R, 2, 0, Math.PI * 2, true);
        context.fill();
      });

      // render polygons
      context.strokeStyle = randomColor();

      // context.beginPath();
      const points = polygon._points;
      const edges = polygon._edges;
      
      let startPoint;
      context.beginPath();
      edges.forEach((edge, i) => {
        // move to start
        if (i === 0) {
          startPoint = points[edge[0]];
          context.moveTo(startPoint.re * R, startPoint.im * R);
        }

        // calculate circle/line info
        const info = PoincareGeodesic.renderInfo(
          points[edge[0]],
          points[edge[1]]
        );

        // render depending on type
        if (info.type === 'line') {
          context.lineTo(info.x2 * R, info.y2 * R);
        } else if (info.type === 'circle') {
          const { x, y, r, startAngle, endAngle, antiClockwise } = info;
          context.arc(x * R, y * R, r * R, startAngle, endAngle, antiClockwise)
        }
      })
      context.lineTo(startPoint.re * R, startPoint.im * R);
      context.closePath();
      context.fill();
      // context.stroke();
    });
    
    context.restore()
  }
}

function randomColor() {
  var r = 255*Math.random()|0,
      g = 255*Math.random()|0,
      b = 255*Math.random()|0;
  return 'rgb(' + r + ',' + g + ',' + b + ')';
}

Poincare = withContentRect('bounds')(Poincare);

export default Poincare;
