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
  mini = false,
}) {
  const {
    parentRef,
    width,
    height: parentHeight,
  } = useParentSize({ debounceTime: 150 });
  const height = mini ? 40 : 300;

  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipLeft, setTooltipLeft] = useState(0);
  const [tooltipTop, setTooltipTop] = useState(0);

  const bisectDate = bisector((d) => d.date).left;

  // Rep-adjustment constants
  const TARGET_REPS = 10;
  const REP_KG_VALUE = 0.25;

  // Prepare data
  const processedData = useMemo(() => {
    console.log("Raw data received:", data);

    const mainData = data
      .map((d) => {
        const weight = isAverage
          ? parseFloat(d.avg_weight)
          : parseFloat(d.weight_kg);
        const reps = parseInt(d.reps || TARGET_REPS);
        // Only apply rep adjustment for non-average data
        const repAdjustment = isAverage
          ? 0
          : (reps - TARGET_REPS) * REP_KG_VALUE;
        return {
          date: new Date(d.record_date),
          value: weight + repAdjustment,
          actualWeight: weight,
          reps: reps,
        };
      })
      .filter((d) => !isNaN(d.value) && isFinite(d.value)); // Filter out invalid values

    console.log("After processing, mainData length:", mainData.length);

    // Duplicate single record to create a horizontal line
    let mainDataForChart = mainData;
    let isSingleRecord = false;
    if (mainData.length === 1) {
      console.log("Single record detected, duplicating...");
      isSingleRecord = true;
      mainDataForChart = [
        {
          ...mainData[0],
          date: new Date(mainData[0].date.getTime() - 86400000),
        }, // 1 day before
        mainData[0],
        {
          ...mainData[0],
          date: new Date(mainData[0].date.getTime() + 86400000),
        }, // 1 day after
      ];
      console.log("Duplicated data:", mainDataForChart);
    }

    const comparisonData = otherData
      ? otherData
          .map((d) => {
            const weight = isAverage
              ? parseFloat(d.avg_weight)
              : parseFloat(d.weight_kg);
            const reps = parseInt(d.reps || TARGET_REPS);
            // Only apply rep adjustment for non-average data
            const repAdjustment = isAverage
              ? 0
              : (reps - TARGET_REPS) * REP_KG_VALUE;
            return {
              date: new Date(d.record_date),
              value: weight + repAdjustment,
              actualWeight: weight,
              reps: reps,
            };
          })
          .filter((d) => !isNaN(d.value) && isFinite(d.value)) // Filter out invalid values
      : [];

    // Duplicate single record to create a horizontal line for comparison
    let comparisonDataForChart = comparisonData;
    if (comparisonData.length === 1) {
      comparisonDataForChart = [
        {
          ...comparisonData[0],
          date: new Date(comparisonData[0].date.getTime() - 86400000),
        },
        comparisonData[0],
        {
          ...comparisonData[0],
          date: new Date(comparisonData[0].date.getTime() + 86400000),
        },
      ];
    }

    console.log("Final mainData:", mainDataForChart);
    console.log("Final comparisonData:", comparisonDataForChart);

    return {
      mainData: mainDataForChart,
      comparisonData: comparisonDataForChart,
      isSingleRecord,
    };
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

    console.log("All dates:", allDates);
    console.log("All values:", allValues);

    const margin = mini
      ? { top: 2, right: 2, bottom: 2, left: 2 }
      : { top: 20, right: 20, bottom: 40, left: 50 };
    const innerWidth = Math.max(width - margin.left - margin.right, 0);
    const innerHeight = Math.max(height - margin.top - margin.bottom, 0);

    console.log(
      "Chart dimensions - width:",
      width,
      "height:",
      height,
      "innerWidth:",
      innerWidth,
      "innerHeight:",
      innerHeight
    );

    const xScale = scaleTime({
      domain: [Math.min(...allDates), Math.max(...allDates)],
      range: [0, innerWidth],
    });

    // Dynamic y-axis: min value - 1 (or 0), max value + 1
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    // Handle case where min and max are the same (single value)
    const yMin =
      minValue === maxValue
        ? Math.max(0, Math.floor(minValue) - 2)
        : Math.max(0, Math.floor(minValue) - 1);
    const yMax =
      minValue === maxValue ? Math.ceil(maxValue) + 2 : Math.ceil(maxValue) + 1;

    console.log("Y scale - min:", yMin, "max:", yMax);

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
        <defs>
          <linearGradient
            id="lineChartGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#D0F500" stopOpacity="0" />
            <stop offset="95%" stopColor="#D0F500" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#D0F500" stopOpacity="0" />
          </linearGradient>
          <linearGradient
            id="singleRecordGradient"
            x1={margin.left}
            y1="0"
            x2={margin.left + innerWidth}
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#D0F500" stopOpacity="0" />
            <stop offset="95%" stopColor="#D0F500" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#D0F500" stopOpacity="0" />
          </linearGradient>
          <linearGradient
            id="comparisonChartGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#9e9e9e" stopOpacity="0" />
            <stop offset="95%" stopColor="#9e9e9e" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#9e9e9e" stopOpacity="0" />
          </linearGradient>
        </defs>
        <Group left={margin.left} top={margin.top}>
          {/* Grid */}
          {!mini && (
            <GridRows
              scale={yScale}
              width={innerWidth}
              strokeDasharray="3,3"
              stroke="#2a2a2a"
              strokeOpacity={0.5}
            />
          )}

          {/* Main Line */}
          {(() => {
            const shouldRender = processedData.mainData.length > 0;
            console.log(
              "Should render main line:",
              shouldRender,
              "Data length:",
              processedData.mainData.length,
              "isSingleRecord:",
              processedData.isSingleRecord
            );

            if (!shouldRender) return null;

            // For single records, render a simple line element instead of LinePath
            if (
              processedData.isSingleRecord &&
              processedData.mainData.length > 0
            ) {
              const yCoord = yScale(getValue(processedData.mainData[0]));
              const lineWidth = mini ? 2 : 3;
              console.log(
                "Rendering single record line at y:",
                yCoord,
                "innerWidth:",
                innerWidth,
                "x1:",
                0,
                "x2:",
                innerWidth
              );
              console.log("Margin:", margin, "Total width:", width);
              return (
                <>
                  <defs>
                    <linearGradient
                      id={`singleLineGradient-${mini ? "mini" : "full"}`}
                      x1="0"
                      y1="0"
                      x2={innerWidth}
                      y2="0"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="0%" stopColor="#D0F500" stopOpacity="0" />
                      <stop
                        offset="95%"
                        stopColor="#D0F500"
                        stopOpacity="0.8"
                      />
                      <stop offset="100%" stopColor="#D0F500" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <line
                    x1={0}
                    x2={innerWidth}
                    y1={yCoord}
                    y2={yCoord}
                    stroke={`url(#singleLineGradient-${
                      mini ? "mini" : "full"
                    })`}
                    strokeWidth={lineWidth}
                    className={
                      mini ? "animate-draw-line-slow" : "animate-draw-line"
                    }
                  />
                </>
              );
            }

            // For multiple records, use LinePath
            console.log(
              "Main line coordinates:",
              processedData.mainData.map((d) => ({
                x: xScale(getDate(d)),
                y: yScale(getValue(d)),
                date: getDate(d),
                value: getValue(d),
              }))
            );

            return (
              <LinePath
                data={processedData.mainData}
                x={(d) => xScale(getDate(d))}
                y={(d) => yScale(getValue(d))}
                stroke="url(#lineChartGradient)"
                strokeWidth={mini ? 2 : 3}
                curve={curveMonotoneX}
                className={
                  mini ? "animate-draw-line-slow" : "animate-draw-line"
                }
              />
            );
          })()}

          {/* Comparison Line */}
          {!mini && processedData.comparisonData.length > 0 && (
            <LinePath
              data={processedData.comparisonData}
              x={(d) => xScale(getDate(d))}
              y={(d) => yScale(getValue(d))}
              stroke="url(#comparisonChartGradient)"
              strokeWidth={2.5}
              curve={curveMonotoneX}
              className="animate-draw-line-dashed"
            />
          )}

          {/* Axes */}
          {!mini && (
            <>
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
                  fontSize: 9,
                  textAnchor: "end",
                  dx: 2,
                  dy: 1,
                })}
              />

              <AxisLeft
                scale={yScale}
                stroke="transparent"
                tickStroke="transparent"
                numTicks={4}
                tickFormat={(value) => `${Math.round(value)} KG`}
                tickLabelProps={() => ({
                  fill: "#888",
                  fontSize: 9,
                  textAnchor: "end",
                  dx: -4,
                })}
              />
            </>
          )}

          {/* Interactive overlay */}
          {!mini && (
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
          )}

          {/* Tooltip indicator */}
          {!mini && tooltipData && (
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
      {!mini && tooltipData && (
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
          className="rounded-lg bg-[#0a0a0a] px-[9] py-2 shadow-[0_0px_48px_0_rgba(255,255,255,0.12)]"
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <div className="flex flex-col">
                <span className="text-[11px] text-white font-medium">
                  {tooltipData.main.actualWeight} KG
                </span>
                <span className="text-[10px] text-gray-500 -mt-0.5">
                  {tooltipData.main.reps} reps
                </span>
              </div>
            </div>
            {tooltipData.comparison && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#686868]" />
                <div className="flex flex-col">
                  <span className="text-[11px] text-white font-medium">
                    {tooltipData.comparison.actualWeight} KG
                  </span>
                  <span className="text-[10px] text-gray-500 -mt-0.5">
                    {tooltipData.comparison.reps} reps
                  </span>
                </div>
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
      {!mini && (
        <div className=" flex items-center justify-center gap-6 -mt-2">
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
      )}
    </div>
  );
}
