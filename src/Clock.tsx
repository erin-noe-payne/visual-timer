import styled from "@emotion/styled";
import * as d3 from "d3";
import { arc } from "d3-shape";
import React, { useEffect, useMemo, useRef } from "react";
import {
  blue,
  green,
  orange1,
  orange2,
  red1,
  red2,
  teal,
  yellow1,
  yellow2,
} from "./colors";

const TIME_UNIT = 1000 * 60;

const CLOCK_SIZE = 100;
const FONT_SIZE = 5;
const tau = Math.PI * 2;

const Svg = styled.svg`
  & .minute {
    font-family: "Lucida Sans", "Lucida Sans Regular", "Lucida Grande",
      "Lucida Sans Unicode", Geneva, Verdana, sans-serif;
    font-size: ${FONT_SIZE}px;
    color: black;
    cursor: pointer;
    user-select: none;
  }

  /* .outer {
    filter: drop-shadow(0 1.5px 1.5px rgba(0, 0, 0, 0.4));
  } */
`;

const boxShadowFromAngle = (angle: number): string => {
  const r = 1.5;
  const x = (Math.sin(angle) * r).toFixed(2);
  const y = (Math.cos(angle) * r).toFixed(2);
  return `drop-shadow(${x}px ${y}px ${r}px rgba(0, 0, 0, 0.4))`;
};

const pieSliceBreakpoints = [1, 2, 3, 4, 5, 10, 15, 20].map(
  (n) => n * TIME_UNIT
);
const pieSlicesData = pieSliceBreakpoints.map((n, i) =>
  i === 0 ? [0, n] : [pieSliceBreakpoints[i - 1], n]
);
const pieSliceColors = [
  red1,
  red2,
  orange1,
  orange2,
  yellow1,
  yellow2,
  green,
  blue,
];

const radToDeg = (rad: number) => (rad * 360) / tau;

const Arrow: React.FC<{ r: number }> = ({ r }) => {
  return (
    <path
      className="arrow"
      d={`M ${r},0 A ${r},${r} 0 1 0 0,${r} L ${r},${r} L ${r},0`}
      fill={teal}
      transform={"rotate(-135)"}
      style={{}}
    />
  );
};

type TimerState = "running" | "paused";

const radius = {
  face: [0, 85],
  pieSegments: [0, 52],
  numbers: [52, 72],
  outer: [72, 85],
};

export const Clock: React.FC<{
  maxTime: number;
  msRemaining: number;
  onDrag: (value: number) => void;
  onRelease: VoidFunction;
  state: TimerState;
}> = ({ maxTime, msRemaining, state, onDrag, onRelease }) => {
  const svgEl = useRef<SVGSVGElement>(null);

  const timeToAngle = useMemo(
    () => d3.scaleLinear().range([0, tau]).domain([0, maxTime]),
    [maxTime]
  );

  useEffect(() => {
    const svg = d3.select(svgEl.current);

    // draw face
    svg
      .select("#face")
      .selectAll(".face")
      .data(["face"])
      .enter()
      .append("path")
      .attr("class", "face")
      .attr("fill", "white")
      .attr("d", () =>
        arc()({
          innerRadius: radius.face[0],
          outerRadius: radius.face[1],
          startAngle: 0,
          endAngle: tau,
        })
      );

    // draw outer ring
    svg
      .select("#face")
      .selectAll(".outer")
      .data(["outer"])
      .enter()
      .append("path")
      .attr("class", "outer")
      .attr("fill", teal)
      .attr("filter", "drop-shadow(0 1.5px 1.5px rgba(0, 0, 0, 0.4))")
      .attr("d", () =>
        arc()({
          innerRadius: radius.outer[0],
          outerRadius: radius.outer[1],
          startAngle: 0,
          endAngle: tau,
        })
      );

    // draw numbers on the face
    const maxMinutes = maxTime / TIME_UNIT;
    const minutes = d3.range(maxMinutes);
    const anglePerMinute = tau / maxMinutes;
    const minutePositions = minutes.map((m) =>
      d3
        .arc()
        .innerRadius(radius.numbers[0])
        .outerRadius(radius.numbers[1])
        .startAngle(m * anglePerMinute - anglePerMinute / 2)
        .endAngle((m + 1) * anglePerMinute - anglePerMinute / 2)
        //@ts-ignore
        .centroid()
    );

    const minuteTicks = d3
      .select(svgEl.current)
      .select("#face")
      .selectAll<SVGTextElement, number[]>(".minute")
      .data(minutes);
    minuteTicks.exit().remove();

    minuteTicks
      .enter()
      .append("text")
      .attr("class", "minute")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .text((d) => d)
      .merge(minuteTicks)
      .attr("x", (_, i) => minutePositions[i][0])
      .attr("y", (_, i) => minutePositions[i][1])
      .on("click", (_, d) => {
        onDrag(d * TIME_UNIT);
        onRelease();
      });

    // add drag interaction
    svg.select("#canvas").call(
      //@ts-ignore
      d3
        .drag()
        .on("start", ({ x, y }) => {
          onDrag(msRemainingAtXY(x, y));
        })
        .on("drag", ({ x, y }) => {
          onDrag(msRemainingAtXY(x, y));
        })
        .on("end", ({ x, y }) => {
          onDrag(msRemainingAtXY(x, y));
          onRelease();
        })
    );
    const msRemainingAtXY = (x: number, y: number) => {
      let angle = Math.atan2(y, x) + tau / 4;
      angle = angle < 0 ? tau + angle : angle;
      const msRemaining = (maxTime * angle) / tau;
      return msRemaining;
    };

    // draw colored pie slices
    svg
      .select("#pieSlices")
      .selectAll(".pieSlice")
      .data(pieSlicesData)
      .enter()
      .append("path")
      .attr("class", "pieSlice")
      .attr("fill", (_, i) => pieSliceColors[i])
      .attr("d", ([startTime, stopTime]) => {
        return arc()({
          innerRadius: radius.pieSegments[0],
          outerRadius: radius.pieSegments[1],
          startAngle: timeToAngle(-startTime),
          endAngle: timeToAngle(-stopTime),
        });
      });

    const mask = svg
      .select("#pieSlices")
      .selectAll<SVGPathElement, string>(".mask")
      .data([
        arc()
          .innerRadius(radius.pieSegments[0])
          .outerRadius(radius.pieSegments[1] + 1)
          .startAngle(0)
          .endAngle(timeToAngle(maxTime - msRemaining)),
      ]);
    mask
      .enter()
      .append("path")
      .attr("class", "mask")
      .attr("fill", "white")
      .merge(mask)
      //@ts-ignore
      .attr("d", (arc) => arc());

    const rotation = svg.select("#rotation");
    const arrow = svg.select(".arrow");
    const startRad = timeToAngle(msRemaining);
    const startDeg = radToDeg(startRad);
    rotation.attr("transform", `rotate(${startDeg})`);
    arrow.attr("filter", boxShadowFromAngle(startRad - (3 * tau) / 8));
    if (state === "running") {
      rotation
        .transition()
        .ease(d3.easeLinear)
        .duration(msRemaining)
        .attrTween("transform", () => {
          const interpolate = d3.interpolate(startDeg, 0);

          return (t: number) => {
            const angle = interpolate(t);
            return `rotate(${angle})`;
          };
        });

      mask
        .transition()
        .ease(d3.easeLinear)
        .duration(msRemaining)
        .attrTween("d", (arc) => {
          const interpolate = d3.interpolate(
            timeToAngle(maxTime - msRemaining),
            tau
          );

          return (t) => {
            arc.endAngle(interpolate(t));
            //@ts-ignore
            return arc();
          };
        });

      arrow
        .transition()
        .ease(d3.easeLinear)
        .duration(msRemaining)
        .attrTween("filter", () => {
          const interpolate = d3.interpolate(startRad, 0);
          return (t: number) => {
            return boxShadowFromAngle(interpolate(t) - (3 * tau) / 8);
          };
        });
    } else {
      rotation.transition();
      mask.transition();
      arrow.transition();
    }
  }, [msRemaining, maxTime, state, timeToAngle, onDrag, onRelease]);

  return (
    <Svg
      ref={svgEl}
      height={`${CLOCK_SIZE}vmin`}
      width={`${CLOCK_SIZE}vmin`}
      viewBox="0 0 200 200"
    >
      <g transform="translate(100,100)">
        <g id="canvas">
          <g id="face" />
          <g id="rotation">
            <g id="pieSlices" />
            <Arrow r={12} />
          </g>
        </g>
      </g>
    </Svg>
  );
};
