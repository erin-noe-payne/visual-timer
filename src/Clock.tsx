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

const CLOCK_SIZE = 70;
const FONT_SIZE = 3;

const Svg = styled.svg`
  & .labels {
    font-family: "Lucida Sans", "Lucida Sans Regular", "Lucida Grande",
      "Lucida Sans Unicode", Geneva, Verdana, sans-serif;
    font-size: ${FONT_SIZE}px;
  }
`;

const segmentColors = [
  red1,
  red2,
  orange1,
  orange2,
  yellow1,
  yellow2,
  green,
  blue,
];

const timeToTheta = (maxTime: number, time: number) => {};

const Arrow: React.FC<{ radius: number }> = ({ radius }) => {
  const l = 50 - radius;
  return (
    <path
      className="arrow"
      d={`M ${l},50 A ${radius},${radius} 0 1 0 50,${l} L ${l},${l} L ${l},50`}
      fill={teal}
      style={{ transformOrigin: "center center" }}
    />
  );
};

type TimerState = "running" | "paused";

export const Clock: React.FC<{
  maxTime: number;
  msRemaining: number;
  state: TimerState;
}> = ({ maxTime, msRemaining, state }) => {
  const svgEl = useRef<SVGSVGElement>(null);

  const timeToAngle = useMemo(
    () =>
      d3
        .scaleLinear()
        .range([0, Math.PI * 2])
        .domain([0, maxTime]),
    [maxTime]
  );

  useEffect(() => {
    const canvas = d3.select(svgEl.current).select("#canvas");

    canvas
      .selectAll(".face")
      .data(["face"])
      .enter()
      .append("path")
      .attr("class", "face")
      .attr("fill", "white")
      .attr("d", () =>
        arc()({
          innerRadius: 0,
          outerRadius: 50,
          startAngle: 0,
          endAngle: Math.PI * 2,
        })
      );

    const segments = [1, 2, 3, 4, 5, 10, 15, 20];

    canvas
      .selectAll(".segment")
      .data(segments)
      .enter()
      .append("path")
      .attr("class", "segment")
      .attr("fill", (d, i) => segmentColors[i])
      .attr("d", (d, i) =>
        arc()({
          innerRadius: 0,
          outerRadius: 40,
          startAngle: timeToAngle(maxTime - d),
          endAngle: timeToAngle(maxTime - (i === 0 ? 0 : segments[i - 1])),
        })
      );

    // const r = 50;
    // const r_labels = r - 5;

    // const labels = svg
    //   .selectAll<SVGTextElement, number>(".labels")
    //   .data(d3.range(0, maxTime));

    // labels.exit().remove();
    // labels
    //   .enter()
    //   .append("text")
    //   .attr("class", "labels")
    //   .attr("text-anchor", "middle")
    //   .merge(labels)
    //   .attr(
    //     "x",
    //     (d) => r_labels * Math.sin((timeToAngle(d) * Math.PI) / 180) + 50
    //   )
    //   .attr(
    //     "y",
    //     (d) =>
    //       -r_labels * Math.cos((timeToAngle(d) * Math.PI) / 180) +
    //       50 +
    //       FONT_SIZE / 2
    //   )
    //   .text((d) => d);

    // svg
    //   .selectAll(".arrow")
    //   .attr("transform", `rotate(${timeToAngle(time) + 45})`);
  }, [msRemaining, maxTime]);

  return (
    <Svg
      ref={svgEl}
      height={`${CLOCK_SIZE}vmin`}
      width={`${CLOCK_SIZE}vmin`}
      viewBox="0 0 100 100"
    >
      <g id="canvas" transform="translate(50,50)"></g>
      {/* <Face cx={50} cy={50} r={50} /> */}
      {/* <circle cx={50} cy={50} r={10}></circle> */}
      {/* <Arrow radius={6} /> */}
    </Svg>
  );
};
