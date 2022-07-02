import styled from "@emotion/styled";
import * as d3 from "d3";
import React, { useEffect, useRef } from "react";
import { teal } from "./colors";

const ringTone = new Audio(
  "https://www.freesoundslibrary.com/wp-content/uploads/2022/03/loud-alarm-clock.mp3#t=12"
);
const ring = () => {
  ringTone.currentTime = 12;
  ringTone.play();
};

const CLOCK_SIZE = 70;
const FONT_SIZE = 3;

const Svg = styled.svg`
  & .labels {
    font-family: "Lucida Sans", "Lucida Sans Regular", "Lucida Grande",
      "Lucida Sans Unicode", Geneva, Verdana, sans-serif;
    font-size: ${FONT_SIZE}px;
  }
`;

const Face = styled.circle`
  fill: white;
`;

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

export const Clock: React.FC<{
  maxTime: number;
  time: number;
  isPaused: boolean;
}> = ({ maxTime, time, isPaused }) => {
  const svgEl = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = d3.select(svgEl.current);

    const r = 50;
    const r_labels = r - 5;

    const timeToAngle = d3.scaleLinear().range([0, 360]).domain([0, maxTime]);

    const labels = svg
      .selectAll<SVGTextElement, number>(".labels")
      .data(d3.range(0, maxTime));

    labels.exit().remove();
    labels
      .enter()
      .append("text")
      .attr("class", "labels")
      .attr("text-anchor", "middle")
      .merge(labels)
      .attr(
        "x",
        (d) => r_labels * Math.sin((timeToAngle(d) * Math.PI) / 180) + 50
      )
      .attr(
        "y",
        (d) =>
          -r_labels * Math.cos((timeToAngle(d) * Math.PI) / 180) +
          50 +
          FONT_SIZE / 2
      )
      .text((d) => d);

    svg
      .selectAll(".arrow")
      .attr("transform", `rotate(${timeToAngle(time) + 45})`);
  }, [time, maxTime]);

  useEffect(() => {
    const svg = d3.select(svgEl.current);

    const arrow = svg.selectAll(".arrow");
    if (isPaused) {
      arrow.transition();
    } else {
      const currentTime = arrow.attr("transform");
      console.log(currentTime);

      arrow
        .transition()
        .duration(time * 1000)
        .ease(d3.easeLinear)
        .attr("transform", `rotate(45)`)
        .on("end", ring);
    }
  }, [isPaused]);

  return (
    <Svg
      ref={svgEl}
      height={`${CLOCK_SIZE}vmin`}
      width={`${CLOCK_SIZE}vmin`}
      viewBox="0 0 100 100"
    >
      <Face cx={50} cy={50} r={50} />
      {/* <circle cx={50} cy={50} r={10}></circle> */}
      <Arrow radius={6} />
    </Svg>
  );
};
