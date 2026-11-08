"use client";

import { useEffect, useRef } from "react";
import { ChartBar, ChartColumn } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BarChart } from "echarts/charts";
import {
  AriaComponent,
  GridComponent,
  TooltipComponent,
} from "echarts/components";
import { graphic, init, use, type EChartsType } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import type { EChartsOption } from "echarts";
import type { ResultRow } from "@/lib/types";
import { glassClassName } from "@/lib/glass-variants";
import { useLocale } from "@/components/locale/locale-provider";
import { formatNumber, translate, type Locale } from "@/lib/i18n";

use([BarChart, AriaComponent, GridComponent, TooltipComponent, CanvasRenderer]);

type DashboardResultsChartProps = {
  results: ResultRow[];
  orientation: DashboardChartOrientation;
};

export type DashboardChartOrientation = "vertical" | "horizontal";

type DashboardChartOrientationSwitchProps = {
  orientation: DashboardChartOrientation;
  onChange: (orientation: DashboardChartOrientation) => void;
};

export function DashboardChartOrientationSwitch({
  orientation,
  onChange,
}: DashboardChartOrientationSwitchProps) {
  const { t } = useLocale();
  const reduceMotion = useReducedMotion();
  const isVertical = orientation === "vertical";
  const Icon = isVertical ? ChartColumn : ChartBar;

  return (
    <motion.button
      type="button"
      role="switch"
      aria-label={t("chartOrientation")}
      aria-checked={isVertical}
      title={t("chartSwitchTitle", { orientation: t(isVertical ? "chartVertical" : "chartHorizontal") })}
      className={glassClassName("clear", "icon-switch-control")}
      data-glass-variant="clear"
      initial={false}
      onClick={() => onChange(isVertical ? "horizontal" : "vertical")}
    >
      <span aria-hidden="true" className="icon-switch-mode-icon icon-switch-mode-icon--left">
        <ChartBar size={14} />
      </span>
      <span aria-hidden="true" className="icon-switch-mode-icon icon-switch-mode-icon--right">
        <ChartColumn size={14} />
      </span>
      <motion.span
        aria-hidden="true"
        className="icon-switch-thumb"
        initial={false}
        animate={{ x: isVertical ? 16 : 0 }}
        whileTap={reduceMotion ? undefined : { scale: 0.9 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : {
                x: { type: "spring", stiffness: 500, damping: 32, mass: 0.5 },
                scale: { type: "spring", stiffness: 620, damping: 24, mass: 0.45 },
              }
        }
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            key={isVertical ? "vertical" : "horizontal"}
            className="grid place-items-center"
            initial={reduceMotion ? false : { opacity: 0, rotate: -45, scale: 0.7 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, rotate: 45, scale: 0.7 }}
            transition={{ duration: reduceMotion ? 0 : 0.16, ease: "easeOut" }}
          >
            <Icon size={14} />
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </motion.button>
  );
}

function cssVariable(element: HTMLElement, name: string, fallback: string) {
  return getComputedStyle(element).getPropertyValue(name).trim() || fallback;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

function wrapLabel(value: string, maxCharacters: number) {
  return value
    .trim()
    .split(/\s+/)
    .flatMap(
      (word) => word.match(new RegExp(`.{1,${maxCharacters}}`, "gu")) ?? [],
    )
    .reduce<string[]>((lines, part) => {
      const lastLine = lines.at(-1);
      if (lastLine && `${lastLine} ${part}`.length <= maxCharacters) {
        lines[lines.length - 1] = `${lastLine} ${part}`;
      } else {
        lines.push(part);
      }
      return lines;
    }, [])
    .join("\n");
}

function chartOption(
  results: ResultRow[],
  element: HTMLElement,
  reducedMotion: boolean,
  orientation: DashboardChartOrientation,
  locale: Locale,
): EChartsOption {
  const ink = cssVariable(element, "--app-ink", "#26382f");
  const chartStart = cssVariable(element, "--app-chart-start", "rgba(101,171,123,.58)");
  const chartMid = cssVariable(element, "--app-chart-mid", "rgba(190,174,119,.5)");
  const chartEnd = cssVariable(element, "--app-chart-end", "rgba(211,158,91,.46)");
  const chartBorder = cssVariable(element, "--app-chart-border", "rgba(255,255,255,.72)");
  const chartShadow = cssVariable(element, "--app-chart-shadow", "rgba(46,74,53,.16)");
  const line = cssVariable(element, "--app-line", "rgba(47, 82, 57, .2)");
  const glassPanel = cssVariable(
    element,
    "--glass-panel",
    "rgba(255,255,255,.2)",
  );
  const glassFallback = cssVariable(element, "--glass-fallback", "#f8fbf7");
  const glassBorder = cssVariable(
    element,
    "--glass-border",
    "rgba(255,255,255,.62)",
  );
  const shadow = cssVariable(
    element,
    "--app-shadow",
    "0 18px 50px rgba(70,43,84,.14)",
  );
  const swapDelay = reducedMotion ? 0 : 400;
  const swapDuration = reducedMotion ? 0 : 800;
  const denseDesktopLabels =
    orientation === "vertical" &&
    element.ownerDocument.documentElement.clientWidth >= 1024 &&
    results.length > 12;
  const compactLabels = results.length > 12 && !denseDesktopLabels;
  const denseLabels = results.length > 20;
  const nameLimit = compactLabels ? 14 : 12;
  const labelFontSize =
    denseDesktopLabels || denseLabels ? 8 : compactLabels ? 9 : 11;
  const rowsById = new Map(results.map((row) => [row.id, row]));
  const denseDesktopLabelLines = denseDesktopLabels
    ? Math.max(
        1,
        ...results.map((row) => wrapLabel(row.name, 8).split("\n").length),
      )
    : 0;

  return {
    backgroundColor: "transparent",
    animation: !reducedMotion,
    animationDuration: 0,
    animationDurationUpdate: 0,
    aria: { enabled: true },
    grid:
      orientation === "vertical"
        ? {
            top: 30,
            right: 14,
            bottom: denseDesktopLabels
              ? Math.max(112, denseDesktopLabelLines * 11 + 32)
              : 94,
            left: 38,
          }
        : { top: 20, right: 42, bottom: 30, left: 160 },
    xAxis:
      orientation === "vertical"
        ? {
            type: "category",
            data: results.map((row) => row.id),
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
              interval: 0,
              rotate: 0,
              align: "center",
              margin: 8,
              color: ink,
              fontSize: labelFontSize,
              lineHeight: 11,
              formatter: (candidateId: string | number) => {
                const row = rowsById.get(String(candidateId));
                if (!row) return "";
                if (denseDesktopLabels) return wrapLabel(row.name, 8);
                return row.name.length > nameLimit
                  ? `${row.name.slice(0, nameLimit - 1)}...`
                  : row.name;
              },
            },
            animationDuration: 0,
            animationDelayUpdate: swapDelay,
            animationDurationUpdate: swapDuration,
            animationEasingUpdate: "cubicOut",
          }
        : {
            type: "value",
            min: 0,
            max: (value) => Math.max(1, Math.ceil(value.max * 1.18)),
            minInterval: 1,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: ink, fontSize: 12, formatter: (value: number) => formatNumber(locale, value) },
            splitLine: { lineStyle: { color: line } },
          },
    yAxis:
      orientation === "vertical"
        ? {
            type: "value",
            min: 0,
            max: (value) => Math.max(1, Math.ceil(value.max * 1.18)),
            minInterval: 1,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: ink, fontSize: 12, formatter: (value: number) => formatNumber(locale, value) },
            splitLine: { lineStyle: { color: line } },
          }
        : {
            type: "category",
            data: results.map((row) => row.id),
            inverse: true,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
              interval: 0,
              align: "right",
              margin: 12,
              color: ink,
              fontSize: 10,
              lineHeight: 12,
              formatter: (candidateId: string | number) => {
                const row = rowsById.get(String(candidateId));
                return row ? wrapLabel(row.name, 20) : "";
              },
            },
            animationDuration: 0,
            animationDelayUpdate: swapDelay,
            animationDurationUpdate: swapDuration,
            animationEasingUpdate: "cubicOut",
          },
    tooltip: {
      trigger: "item",
      className: glassClassName("frosted", "glasscn-chart-tooltip"),
      backgroundColor: glassFallback,
      borderColor: glassBorder,
      borderWidth: 1,
      borderRadius: 16,
      padding: 12,
      textStyle: { color: ink },
      extraCssText: `box-shadow: ${shadow};`,
      formatter: (params) => {
        const item = Array.isArray(params) ? params[0] : params;
        const row = rowsById.get(String(item?.name ?? ""));
        if (!row) return "";
        return `<strong>${escapeHtml(row.name)}</strong><br/><span>${escapeHtml(formatNumber(locale, row.total))} ${escapeHtml(translate(locale, "chartSelections"))}</span>`;
      },
      axisPointer: { type: "shadow", shadowStyle: { color: glassPanel } },
    },
    series: [
      {
        id: "candidate-vote-totals",
        type: "bar",
        realtimeSort: true,
        barMaxWidth: orientation === "vertical" ? 58 : 30,
        barCategoryGap: orientation === "vertical" ? "38%" : "24%",
        data: results.map((row) => ({
          id: row.id,
          name: row.id,
          value: row.total,
          itemStyle: { borderColor: chartBorder, borderWidth: 1 },
        })),
        itemStyle: {
          color: new graphic.LinearGradient(
            0,
            0,
            orientation === "vertical" ? 0 : 1,
            orientation === "vertical" ? 1 : 0,
            [
              { offset: 0, color: chartStart },
              { offset: 0.45, color: chartMid },
              { offset: 1, color: chartEnd },
            ],
          ),
          borderRadius:
            orientation === "vertical" ? [8, 8, 0, 0] : [0, 8, 8, 0],
          borderColor: chartBorder,
          borderWidth: 1,
          shadowBlur: 12,
          shadowColor: chartShadow,
          shadowOffsetY: 3,
        },
        label: {
          show: true,
          position: orientation === "vertical" ? "top" : "right",
          color: ink,
          fontSize: denseLabels ? 9 : compactLabels ? 10 : 12,
          fontWeight: 700,
          valueAnimation: false,
        },
        animationDuration: 0,
        animationDurationUpdate: 0,
      },
    ],
  };
}

export function DashboardResultsChart({
  results,
  orientation,
}: DashboardResultsChartProps) {
  const { locale, t } = useLocale();
  const localeRef = useRef(locale);
  localeRef.current = locale;
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<EChartsType | null>(null);
  const resultsRef = useRef(results);
  const orientationRef = useRef(orientation);
  const reducedMotionRef = useRef(false);
  resultsRef.current = results;
  orientationRef.current = orientation;

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const chart = init(element, undefined, { renderer: "canvas" });
    chartRef.current = chart;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mediaQuery.matches;

    const updateChart = () => {
      if (chart.isDisposed()) return;
      chart.setOption(
        chartOption(
          resultsRef.current,
          element,
          reducedMotionRef.current,
          orientationRef.current,
          localeRef.current,
        ),
      );
    };

    updateChart();

    const resizeObserver = new ResizeObserver(() => {
      chart.resize();
      updateChart();
    });
    resizeObserver.observe(element);

    const onMotionPreferenceChange = (event: MediaQueryListEvent) => {
      reducedMotionRef.current = event.matches;
      updateChart();
    };
    mediaQuery.addEventListener("change", onMotionPreferenceChange);

    const themeObserver = new MutationObserver(updateChart);
    const themeRoot = document.documentElement;
    themeObserver.observe(themeRoot, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    return () => {
      resizeObserver.disconnect();
      mediaQuery.removeEventListener("change", onMotionPreferenceChange);
      themeObserver.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    const element = containerRef.current;
    if (!chart || !element || chart.isDisposed()) return;
    chart.setOption(
      chartOption(results, element, reducedMotionRef.current, orientation, locale),
    );
  }, [results, orientation, locale]);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={t("chartAria", { type: t(orientation === "vertical" ? "chartVerticalType" : "chartHorizontalType") })}
      style={{
        width: "100%",
        height:
          orientation === "vertical" ? 390 : Math.max(390, results.length * 42),
      }}
    />
  );
}
