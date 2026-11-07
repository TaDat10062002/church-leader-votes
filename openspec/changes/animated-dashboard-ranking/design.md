# Design

## Context

See `proposal.md` for motivation and `specs/dashboard-results-visualization/spec.md` for observable behavior. The dashboard currently renders a vertical Recharts `BarChart` from the API result snapshot. Results already arrive sorted by total, and the refresh/state flow is managed by `Dashboard`.

## Goals / Non-Goals

**Goals:**
- Move each candidate column horizontally when live results change rank, including passing one or more lower-total columns.
- Keep the existing vertical chart, styling, candidate identity, and live result source.
- Keep chart animation local to the visualization.

**Non-Goals:**
- Change API routes, response data, backend aggregation, refresh triggers, or application state management.
- Add a separate animation framework for individual SVG bar geometry.

## Decisions

### Use Apache ECharts for the dashboard chart

Replace the Recharts chart with Apache ECharts and use its dynamic bar sorting behavior. ECharts documents `realtimeSort` for ranking animations and explains how to transpose the axes for vertical bars. When a candidate's total overtakes the candidate immediately to its left, the candidate's bar moves across that slot; for larger rank changes, it moves past each lower-total bar into its new position. Delay category-axis position updates by 180ms, then animate them for 650ms; set the bar series' value update animation to zero so a new vote does not present as a growing bar. Disable the delay and transition when reduced motion is enabled. Keep the chart's input sourced from the existing `data.results` snapshot and identify data items by candidate ID so updates remain associated with the same candidate.

Use ECharts' modular core imports and initialize the chart in a client-side effect, disposing it when the component unmounts. Resize the chart with its container. This avoids adding a React wrapper and keeps chart lifecycle work inside the chart component.

Alternatives considered:
- **Keep Recharts and write custom bar transitions:** retains the current dependency but requires custom position interpolation and identity handling for each SVG bar.
- **Use Motion around Recharts bars:** Motion is already installed, but its layout animation feature does not support SVG layout, so it does not provide a direct solution for moving the existing SVG bars.

### Keep the result flow unchanged

The component passes the current result snapshot into ECharts. The existing result fetch, Supabase notifications, React state updates, server-side aggregation, and API contract stay untouched. The chart engine handles only presentation and animation.

### Fit all candidates on desktop and preserve mobile scrolling

On desktop, size the chart to the available card width so every candidate column is visible together. Show names below the columns without candidate images; for dense desktop charts, wrap full names across horizontal lines so labels remain upright and readable. Recalculate the label layout when resizing across the desktop breakpoint. On mobile, keep the existing minimum chart width, show names without candidate images, and preserve horizontal scrolling. The ranked result cards below the chart continue to show full names, avatars, and totals.

Use ECharts axis labels for candidate names only. Preserve the existing tooltip information and the ranked result cards as a readable non-canvas representation of the totals.

### Switch chart orientation

Place a two-option Dọc/Ngang control at the top-right of the chart card. Keep vertical columns as the default. Horizontal mode swaps the category and value axes, puts candidate names on the left, and displays the highest total at the top. Keep the selected orientation as local presentation state; changing it does not affect results, API requests, or election state. Preserve the existing mobile horizontal scroll behavior in vertical mode; horizontal mode uses the available chart width and grows its height to fit the roster.

## Risks / Trade-offs

- [ECharts' vertical realtime sorting and per-series animation settings may interact differently than the horizontal bar-race example] → Validate the vertical axis configuration with live reordering and tune axis and series update durations separately.
- [Axis labels and the current glass tooltip need ECharts-specific formatting] → Port these as presentation callbacks and compare the rendered dashboard at narrow and wide widths.
- [ECharts adds chart bundle weight] → Import only the required chart, components, and renderer from `echarts/core`.
- [Motion preferences may be ignored by chart defaults] → Disable chart animations when the user requests reduced motion.

## Migration Plan

No data or backend migration is required. Replace only the dashboard chart renderer, retain the current result snapshot as its input, and remove Recharts if no other component uses it. Rollback by restoring the existing Recharts chart component and dependency.
