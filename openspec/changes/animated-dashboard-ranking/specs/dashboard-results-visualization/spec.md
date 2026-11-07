# Spec Delta

## Purpose

Defines how the administrator dashboard presents live candidate totals and communicates ranking changes through animated movement of the vertical columns.

## ADDED Requirements

### Requirement: Dashboard preserves the live results ranking
The dashboard SHALL display every official candidate in a vertical column chart, ordered from highest to lowest valid vote total from left to right, with a consistent secondary order for ties.

#### Scenario: Dashboard receives updated results
- **WHEN** the dashboard refreshes results for an active election
- **THEN** it displays each candidate's latest valid vote total in descending order

#### Scenario: Candidates are tied
- **WHEN** two or more candidates have equal valid vote totals
- **THEN** the dashboard keeps them in a consistent secondary order

#### Scenario: Desktop dashboard shows every candidate at once
- **WHEN** an administrator views the dashboard at a desktop viewport width
- **THEN** all candidate columns fit within the chart without horizontal scrolling and candidate names appear horizontally below the columns without images; dense rosters use wrapped full-name labels

#### Scenario: Mobile dashboard preserves chart scrolling
- **WHEN** an administrator views the dashboard at a mobile viewport width
- **THEN** the chart remains horizontally scrollable as needed to view every candidate, with names below the columns and no candidate images

### Requirement: Dashboard supports vertical and horizontal chart views
The dashboard SHALL provide an accessible control for switching between vertical columns and horizontal bars. Changing orientation SHALL preserve the current result data and descending ranking.

#### Scenario: Switch to horizontal bars
- **WHEN** an administrator selects the horizontal chart view
- **THEN** each candidate is shown as a horizontal bar and candidates remain ordered from highest to lowest vote total from top to bottom

#### Scenario: Switch back to vertical columns
- **WHEN** an administrator selects the vertical chart view
- **THEN** the dashboard returns to the current vertical column chart without changing the result data

### Requirement: Ranking changes animate as column position changes
When refreshed results change candidate order, the dashboard SHALL add a brief pause before smoothly animating each candidate's column as it swaps past lower-total candidates into its new rank position. The primary ranking transition SHALL be position movement rather than a bar-size growth effect.

#### Scenario: A candidate overtakes the candidate ranked directly above
- **WHEN** a results refresh gives a candidate a higher total than the candidate immediately to its left
- **THEN** the two candidate columns swap horizontal positions and the higher-total candidate appears first

#### Scenario: A candidate overtakes multiple candidates
- **WHEN** a results refresh gives a candidate a total greater than candidates in several higher positions
- **THEN** its column moves horizontally past those lower-total columns into the correct descending position

#### Scenario: A candidate total changes without changing rank
- **WHEN** a results refresh changes a candidate's total but leaves the candidate's rank unchanged
- **THEN** the dashboard updates the displayed total without a ranking-position transition
