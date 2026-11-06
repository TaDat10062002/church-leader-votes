# Spec Delta

## Purpose

Defines the supported election lifecycle states and keeps the public voting experience aligned with the current election state as it changes.

## ADDED Requirements

### Requirement: Elections use opened and closed status values
The system SHALL store election status using the `opened` and `closed` values, and SHALL create a new election in the `opened` state.

#### Scenario: A new election starts
- **WHEN** an administrator starts an election with a valid candidate roster
- **THEN** the persisted election status is `opened`

#### Scenario: Existing open elections are migrated
- **WHEN** the status migration is applied to an existing database
- **THEN** each existing `open` status is converted to `opened` and existing `closed` statuses remain `closed`

### Requirement: Voters see the ballot only while an election is opened
The system SHALL show the current election's official candidates and ballot while its status is `opened`, and SHALL hide the ballot and show a closed-election notice while its status is `closed`.

#### Scenario: Voter opens a page with an opened election
- **WHEN** the voter page loads and the current election has status `opened`
- **THEN** the page displays that election's official candidates and ballot

#### Scenario: Voter opens a page with a closed election
- **WHEN** the voter page loads and the current election has status `closed`
- **THEN** the page hides the candidate list and ballot controls and displays that voting is closed

#### Scenario: No election exists
- **WHEN** the voter page loads and there is no current election
- **THEN** the page does not display a ballot and explains that voting is unavailable

### Requirement: Voter page reflects election status changes in realtime
The system SHALL update the voter page when the current election is opened or closed without requiring a manual refresh.

#### Scenario: Current election closes while the voter page is open
- **WHEN** the current election changes from `opened` to `closed`
- **THEN** the page immediately hides the candidates and ballot controls and displays the closed-election notice

#### Scenario: An election opens while the voter page is open
- **WHEN** an election becomes the current election with status `opened`
- **THEN** the page loads its official candidates and displays the ballot without requiring a manual refresh

### Requirement: Closed elections reject ballot submissions
The system SHALL accept ballot submissions only for elections whose status is `opened`, regardless of the status displayed by a voter's page.

#### Scenario: A stale page submits after an election closes
- **WHEN** a ballot is submitted for an election whose persisted status is `closed`
- **THEN** the system rejects the ballot and records no vote or selections
