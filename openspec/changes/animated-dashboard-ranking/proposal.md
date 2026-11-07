# Proposal

## Why

When live vote totals change the ranking, the dashboard should make the change in candidate positions clear. Animating columns as they exchange horizontal positions will make ranking changes easier to follow.

## What Changes

- Animate candidate columns moving to their new left-to-right rank when refreshed results change order.
- Keep the chart vertical, descending by valid vote total, and visually consistent with the current dashboard.
- Add a dashboard control to switch between the existing vertical columns and horizontal bars, defaulting to vertical.
- Fit every candidate column within the desktop chart viewport; preserve horizontal scrolling on mobile.
- Keep the existing API contract, backend aggregation, refresh behavior, and application state flow unchanged.

## Capabilities

### New Capabilities
- `dashboard-results-visualization`: Defines how the dashboard presents and animates live candidate result rankings.

### Modified Capabilities
- None. The repository has no synced main specs; the related result behavior currently exists only in another change's delta spec.

## Impact

- Dashboard chart implementation in `src/components/dashboard.tsx`.
- Chart dependencies in `package.json` and the package lockfile, if the selected ECharts React integration requires them.
- No API routes, backend aggregation, or application state management changes.
