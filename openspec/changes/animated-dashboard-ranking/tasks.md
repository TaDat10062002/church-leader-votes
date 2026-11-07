# Tasks

## 1. Replace the chart renderer

- [x] 1.1 Add Apache ECharts with modular imports and verify the dashboard can load the chart in the client without changing its API result or React state flow.
- [x] 1.2 Replace the Recharts chart with a responsive ECharts vertical bar chart and verify existing colors, tooltip, candidate names, and horizontal scrolling remain legible.

## 2. Animate ranking changes

- [x] 2.1 Configure realtime sorting, stable candidate identity, vertical axes, and independent axis/series update durations; verify a candidate column swaps horizontally past lower-total columns when it overtakes them, without a bar-height growth animation.
- [x] 2.2 Respect reduced-motion preferences and verify the chart still updates totals and ranking without animated transitions when reduced motion is enabled.

## 3. Integrate and validate

- [x] 3.1 Remove Recharts if it has no remaining uses and verify the dependency tree and lockfile match the chart implementation.
- [x] 3.2 Review the dashboard at narrow and wide viewport sizes and verify empty, tied, and reordered results remain readable and correctly ranked.

## 4. Fit the full roster on desktop

- [x] 4.1 Make the desktop chart fit every candidate column with identifiable names while preserving mobile name labels and horizontal scrolling; verify with a large roster at both viewport sizes.

## 5. Switch chart orientation

- [x] 5.1 Add an accessible Dọc/Ngang control and support horizontal bars while retaining the current vertical view, result ordering, animations, and mobile scrolling; verify both orientations with a large roster.
- [x] 5.2 Add a brief delay and a slower position transition when candidates swap ranks, while keeping bar-size animation disabled and honoring reduced-motion preferences; verify the swap timing in both orientations.
