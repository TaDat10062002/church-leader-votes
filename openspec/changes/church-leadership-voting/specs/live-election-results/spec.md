# Spec Delta

## Purpose

Defines the administrator's live view of candidate vote totals for the active election so results remain current as valid ballots arrive.

## ADDED Requirements

### Requirement: Dashboard shows aggregate totals in descending order
The system SHALL display a vertical chart of the active election's official candidates, ordered from highest to lowest valid vote count from left to right.

#### Scenario: Dashboard loads election results
- **WHEN** an administrator with a valid session opens the dashboard for an active election
- **THEN** the system displays each official candidate and that candidate's aggregate vote count in descending order

#### Scenario: Candidates have equal vote totals
- **WHEN** two or more candidates have the same vote count
- **THEN** the system displays all tied candidates and applies a consistent secondary ordering

### Requirement: Dashboard results update after each valid ballot
The system SHALL update dashboard totals in realtime when a valid ballot is recorded for the active election.

#### Scenario: A new valid ballot is recorded
- **WHEN** a voter successfully submits a valid ballot while the administrator dashboard is open
- **THEN** the dashboard updates the affected candidate totals and maintains descending order without requiring a manual page refresh

#### Scenario: An invalid ballot is rejected
- **WHEN** a ballot fails validation and is not recorded
- **THEN** the dashboard totals do not change
