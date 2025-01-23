import React from "react";
import { ParentSize } from "@visx/responsive";
import { scaleLinear } from "@visx/scale";
import { Area } from "@visx/shape";
import { curveBasis } from "@visx/curve";
import { LinearGradient } from "@visx/gradient";

interface DataPoint {
  index: number;
  value: number;
  label: string;
  percentage?: number;
  formattedPercentage?: string;
  trend: number;
}

interface FunnelChartProps {
  data: DataPoint[];
  trendPercentages: number[];
  width: number;
  height: number;
  isPercentage: boolean;
}


const FunnelChart: React.FC<FunnelChartProps> = ({
  data,
  trendPercentages,
  width,
  height,
  isPercentage,
}) => {
  const x = (d: DataPoint) => d.index;
  const y = (d: DataPoint) => d.value; // Always use the value for plotting

  const interpolateData = (segments: DataPoint[]): DataPoint[] => {
    const interpolatePoints = (
      current: DataPoint,
      next?: DataPoint
    ): DataPoint[] => {
      if (!next) return [current];
      const xStep = 0.25;
      const yStep = Math.abs(y(next) - y(current)) * 0.03;
      const yMid1 = Math.abs(y(current) - yStep);
      const yMid2 = Math.abs(y(next) + yStep);
      const xMid1 = Math.abs(x(current) + xStep);
      const xMid2 = Math.abs(x(next) - xStep);
      return [
        current,
        {
          index: xMid1,
          value: yMid1,
          label: "",
          percentage: current.percentage,
          formattedPercentage: current.formattedPercentage,
          trend: current.trend,
        },
        {
          index: xMid2,
          value: yMid2,
          label: "",
          percentage: next.percentage,
          formattedPercentage: next.formattedPercentage,
          trend: next.trend,
        },
      ];
    };

    return segments.flatMap((d, i) => interpolatePoints(d, segments[i + 1]));
  };



  const numSegments = Math.max(...data.map(x));
  const interpolatedData = interpolateData(data);
  const maxValue = Math.max(...interpolatedData.map((d) => y(d)));

  const valuePadding = 50;
  const minmax = maxValue + valuePadding;
  const padding = width / numSegments / 2;

  const xScale = scaleLinear({
    range: [0, width],
    domain: [0, numSegments],
  });
  const yScale = scaleLinear({
    range: [height, 0],
    domain: [-minmax, minmax],
  });

  const areas = [
    { pad: 0, opacity: 1 },
    { pad: 15, opacity: 0.2 },
    { pad: 30, opacity: 0.1 },
  ];

  return (
    <svg width={width} height={height}>
      <LinearGradient
        id="gradient"
        from="#2167f9"
        to="#a479ff"
        vertical={false}
      />
      <rect width={width} height={height} fill="#1d1d29" rx={22} />
      {areas.map((area, i) => (
        <Area
          key={`area-${i}`}
          data={interpolatedData}
          curve={curveBasis}
          x={(d) => xScale(x(d))}
          y0={(d) => yScale(y(d) + area.pad)}
          y1={(d) => yScale(-y(d) - area.pad)}
          fill="url(#gradient)"
          fillOpacity={area.opacity}
          stroke="transparent"
        />
      ))}
      {data.map((d, i) => (
        <React.Fragment key={`label-${i}`}>
          <text
            x={xScale(x(d)) + padding}
            y={height / 2}
            dy=".33em"
            fill="white"
            fontSize={22}
            textAnchor="middle"
          >
            {isPercentage ? d.formattedPercentage : `${d.value}`}
          </text>
          <text
            x={xScale(x(d)) + padding}
            y={5}
            dy=".33em"
            fill="white"
            fontSize={12}
            textAnchor="middle"
          >
            {d.label}
          </text>
          <text
            x={xScale(x(d)) + padding}
            y={height - 10} // Adjust the y position as needed
            dy=".33em"
            fill="white"
            fontSize={12}
            textAnchor="middle"
          >
            {`${d.trend}%`}
          </text>
          {i < data.length - 1 && (
            <line
              x1={xScale(x(d) + 1)}
              x2={xScale(x(d) + 1)}
              y1={0}
              y2={height}
              stroke="#2b2d3f"
              strokeWidth={4}
            />
          )}
        </React.Fragment>
      ))}
    </svg>
  );
};

interface FunnelChartComponentProps {
  data: DataPoint[];
  isPercentage: boolean;
  trendPercentages: number[];
}

const FunnelChartComponent: React.FC<FunnelChartComponentProps> = ({
  data,
  isPercentage,
  trendPercentages
}) => {
  return (
    <div className="Chart max-w-full h-96 md:h-96 px-2">
      <ParentSize>
        {({ width, height }) => (
          <FunnelChart
            data={data}
            width={width}
            height={height}
            isPercentage={isPercentage}
            trendPercentages={trendPercentages}
          />
        )}
      </ParentSize>
    </div>
  );
};

export default FunnelChartComponent;
