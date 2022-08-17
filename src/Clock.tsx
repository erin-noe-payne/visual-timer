import styled from "@emotion/styled";
import * as d3 from "d3";
import { arc } from "d3-shape";
import { interpolateObject } from "d3-interpolate";
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

const segmentBreakpoints = [1, 2, 3, 4, 5, 10, 15, 20].map((n) => n * 1000);
const segmentsData = segmentBreakpoints.map((n, i) =>
  i === 0 ? [0, n] : [segmentBreakpoints[i - 1], n]
);
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

const radToDeg = (rad: number) => (rad * 180) / Math.PI;

const Arrow: React.FC<{ r: number }> = ({ r }) => {
  return (
    <path
      className="arrow"
      d={`M ${r},0 A ${r},${r} 0 1 0 0,${r} L ${r},${r} rL ${r},0`}
      fill={teal}
      transform={"rotate(-135)"}
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
    const svg = d3.select(svgEl.current);

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
          innerRadius: 0,
          outerRadius: 50,
          startAngle: 0,
          endAngle: Math.PI * 2,
        })
      );

    svg
      .select("#segments")
      .selectAll(".segment")
      .data(segmentsData)
      .enter()
      .append("path")
      .attr("class", "segment")
      .attr("fill", (_, i) => segmentColors[i])
      .attr("d", ([startTime, stopTime]) => {
        return arc()({
          innerRadius: 0,
          outerRadius: 40,
          startAngle: timeToAngle(-startTime),
          endAngle: timeToAngle(-stopTime),
        });
      });

    const mask = svg
      .select("#segments")
      .selectAll<SVGPathElement, string>(".mask")
      .data([
        arc()
          .innerRadius(0)
          .outerRadius(41)
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

    // TODO: draw segments only once, animate a white mask over top of segments
    //   .transition()
    //   .ease(d3.easeLinear)
    //   .duration(([startTime, stopTime]) => Math.max(msRemaining - startTime, 0))
    //   .attr("d", ([startTime, stopTime]) =>
    //     arc()({
    //       innerRadius: 0,
    //       outerRadius: 40,
    //       startAngle: 0,
    //       endAngle: msRemaining - stopTime < 0 ? 0 : timeToAngle(stopTime),
    //     })
    //   );

    const rotation = svg.select("#rotation");
    const startAngle = radToDeg(timeToAngle(msRemaining));
    rotation.attr("transform", `rotate(${startAngle})`);
    if (state === "running") {
      rotation
        .transition()
        .ease(d3.easeLinear)
        .duration(msRemaining)
        .attrTween("transform", () => {
          const interpolate = d3.interpolate(startAngle, 0);

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
            Math.PI * 2
          );

          return (t) => {
            arc.endAngle(interpolate(t));
            //@ts-ignore
            return arc();
          };
        });
    } else {
      rotation.transition();
      mask.transition();
    }

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
  }, [msRemaining, maxTime, state, timeToAngle]);

  return (
    <Svg
      ref={svgEl}
      height={`${CLOCK_SIZE}vmin`}
      width={`${CLOCK_SIZE}vmin`}
      viewBox="0 0 100 100"
    >
      <g transform="translate(50,50)">
        <g id="face" />
        <g id="rotation">
          <g id="segments" />
          <Arrow r={6} />
        </g>
      </g>
    </Svg>
  );
};
