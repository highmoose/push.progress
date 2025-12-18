"use client";

import { useMemo, useState, useCallback } from "react";
import { Group } from "@visx/group";
import { scaleTime, scaleLinear } from "@visx/scale";
import { LinePath } from "@visx/shape";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridRows } from "@visx/grid";
import { curveMonotoneX } from "@visx/curve";
import { useParentSize } from "@visx/responsive";
import { localPoint } from "@visx/event";
import { bisector } from "d3-array";

export default function LineChart({
  data,
  otherData,
  userName,
  otherUserName,
  isAverage = false,
}) {
  const {
    parentRef,
    width,
    height: parentHeight,
  } = useParentSize({ debounceTime: 150 });
  const height = 300;

  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipLeft, setTooltipLeft] = useState(0);
  const [tooltipTop, setTooltipTop] = useState(0);

  const bisectDate = bisector((d) => d.date).left;

  // Prepare data
  const processedData = useMemo(() => {
    const mainData = data.map((d) => ({
      date: new Date(d.record_date),
      value: isAverage ? parseFloat(d.avg_weight) : parseFloat(d.weight_kg),
    }));

    const comparisonData = otherData
      ? otherData.map((d) => ({
          date: new Date(d.record_date),
          value: isAverage ? parseFloat(d.avg_weight) : parseFloat(d.weight_kg),
        }))
      : [];

    return { mainData, comparisonData };
  }, [data, otherData, isAverage]);

  // Accessors
  const getDate = (d) => d.date;
  const getValue = (d) => d.value;

  // Scales
  const { xScale, yScale, margin, innerWidth, innerHeight } = useMemo(() => {
    const allDates = [
      ...processedData.mainData.map(getDate),
      ...processedData.comparisonData.map(getDate),
    ];

    const allValues = [
      ...processedData.mainData.map(getValue),
      ...processedData.comparisonData.map(getValue),
    ];

    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const innerWidth = Math.max(width - margin.left - margin.right, 0);
    const innerHeight = Math.max(height - margin.top - margin.bottom, 0);

    const xScale = scaleTime({
      domain: [Math.min(...allDates), Math.max(...allDates)],
      range: [0, innerWidth],
    });

    // Dynamic y-axis: min value - 1 (or 0), max value + 1
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    const yMin = Math.max(0, Math.floor(minValue) - 1);
    const yMax = Math.ceil(maxValue) + 1;

    const yScale = scaleLinear({
      domain: [yMin, yMax],
      range: [innerHeight, 0],
    });

    return { xScale, yScale, margin, innerWidth, innerHeight };
  }, [processedData, width, height]);

  // Calculate dynamic tick count for x-axis
  const numXTicks = useMemo(() => {
    const dataPoints = processedData.mainData.length;
    if (innerWidth < 300) return 3;
    if (innerWidth < 500) return Math.min(5, dataPoints);
    return Math.min(8, dataPoints);
  }, [innerWidth, processedData.mainData.length]);

  // Handle mouse events for tooltip
  const handleTooltip = useCallback(
    (event) => {
      const { x } = localPoint(event) || { x: 0 };
      const x0 = xScale.invert(x);

      if (processedData.mainData.length === 0) return;

      const index = bisectDate(processedData.mainData, x0, 1);
      const d0 = processedData.mainData[index - 1];
      const d1 = processedData.mainData[index];

      let mainDataPoint = d0;
      if (d1 && getDate(d1)) {
        mainDataPoint =
          x0.valueOf() - getDate(d0).valueOf() >
          getDate(d1).valueOf() - x0.valueOf()
            ? d1
            : d0;
      }

      // Find corresponding comparison data point
      let comparisonDataPoint = null;
      if (processedData.comparisonData.length > 0) {
        const compIndex = bisectDate(processedData.comparisonData, x0, 1);
        const c0 = processedData.comparisonData[compIndex - 1];
        const c1 = processedData.comparisonData[compIndex];

        if (c0 && c1 && getDate(c1)) {
          comparisonDataPoint =
            x0.valueOf() - getDate(c0).valueOf() >
            getDate(c1).valueOf() - x0.valueOf()
              ? c1
              : c0;
        } else if (c0) {
          comparisonDataPoint = c0;
        }
      }

      setTooltipData({
        main: mainDataPoint,
        comparison: comparisonDataPoint,
      });
      setTooltipLeft(xScale(getDate(mainDataPoint)));
      setTooltipTop(yScale(getValue(mainDataPoint)));
    },
    [xScale, yScale, processedData, bisectDate]
  );

  const handleMouseLeave = useCallback(() => {
    setTooltipData(null);
  }, []);

  if (width === 0) {
    return <div ref={parentRef} style={{ width: "100%", height }} />;
  }

  return (
    <div ref={parentRef} style={{ width: "100%", position: "relative" }}>
      <svg width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
          {/* Grid */}
          <GridRows
            scale={yScale}
            width={innerWidth}
            strokeDasharray="3,3"
            stroke="#2a2a2a"
            strokeOpacity={0.5}
          />

          {/* Main Line */}
          {processedData.mainData.length > 0 && (
            <LinePath
              data={processedData.mainData}
              x={(d) => xScale(getDate(d))}
              y={(d) => yScale(getValue(d))}
              stroke="#D0F500"
              strokeWidth={4}
              curve={curveMonotoneX}
            />
          )}

          {/* Comparison Line */}
          {processedData.comparisonData.length > 0 && (
            <LinePath
              data={processedData.comparisonData}
              x={(d) => xScale(getDate(d))}
              y={(d) => yScale(getValue(d))}
              stroke="#686868"
              strokeWidth={2.5}
              strokeDasharray="5,5"
              curve={curveMonotoneX}
            />
          )}

          {/* Axes */}
          <AxisBottom
            top={innerHeight}
            scale={xScale}
            stroke="transparent"
            tickStroke="#444"
            numTicks={numXTicks}
            tickFormat={(date) => {
              const month = date.toLocaleDateString("en-UK", {
                month: "short",
              });
              const day = date.getDate();
              return `${month} ${day}`;
            }}
            tickLabelProps={() => ({
              fill: "#888",
              fontSize: 10,
              textAnchor: "middle",
            })}
          />

          <AxisLeft
            scale={yScale}
            stroke="transparent"
            tickStroke="transparent"
            numTicks={4}
            tickFormat={(value) => `${Math.round(value)} kg`}
            tickLabelProps={() => ({
              fill: "#888",
              fontSize: 10,
              textAnchor: "end",
              dx: -4,
            })}
          />

          {/* Interactive overlay */}
          <rect
            width={innerWidth}
            height={innerHeight}
            fill="transparent"
            onMouseMove={handleTooltip}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTooltip}
            onTouchMove={handleTooltip}
            style={{ cursor: "crosshair" }}
          />

          {/* Tooltip indicator */}
          {tooltipData && (
            <>
              <line
                x1={tooltipLeft}
                x2={tooltipLeft}
                y1={0}
                y2={innerHeight}
                stroke="#D0F500"
                strokeWidth={1}
                strokeDasharray="4,4"
                opacity={0.5}
              />
              <circle
                cx={tooltipLeft}
                cy={tooltipTop}
                r={6}
                fill="#D0F500"
                stroke="#0a0a0a"
                strokeWidth={2}
              />
              {tooltipData.comparison && (
                <circle
                  cx={tooltipLeft}
                  cy={yScale(getValue(tooltipData.comparison))}
                  r={5}
                  fill="#686868"
                  stroke="#0a0a0a"
                  strokeWidth={2}
                />
              )}
            </>
          )}
        </Group>
      </svg>

      {/* Tooltip Popover */}
      {tooltipData && (
        <div
          style={{
            position: "absolute",
            left: tooltipLeft + margin.left,
            top: tooltipTop + margin.top - 10,
            transform: "translate(-50%, -100%)",
            pointerEvents: "none",
            maxWidth: "150px",
            whiteSpace: "nowrap",
          }}
          className="rounded-lg bg-[#0a0a0a] px-3 py-2 shadow-[0_-12px_64px_0_rgba(255,255,255,0.12)]"
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-xs text-white font-medium">
                {getValue(tooltipData.main)} kg
              </span>
            </div>
            {tooltipData.comparison && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#686868]" />
                <span className="text-xs text-gray-400 font-medium">
                  {getValue(tooltipData.comparison)} kg
                </span>
              </div>
            )}
            <div className="text-[12px] text-gray-500 mt-1 text-center">
              {getDate(tooltipData.main).toLocaleDateString("en-UK", {
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className=" flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-[3px] w-6 bg-primary" />
          <span className="text-xs text-gray-400">{userName}</span>
        </div>
        {otherData && otherData.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-6 border-t-2 border-dashed border-[#686868] opacity-60" />
            <span className="text-xs text-gray-400">{otherUserName}</span>
          </div>
        )}
      </div>
    </div>
  );
}
