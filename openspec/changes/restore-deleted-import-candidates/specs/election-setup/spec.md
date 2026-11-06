# Spec Delta

## Purpose

Defines how administrators manage provisional candidates removed from the waiting roster and restore individual candidates before publishing an election roster.

## ADDED Requirements

### Requirement: Administrator can delete a provisional candidate into a separate deleted list
The system SHALL remove a selected provisional candidate from the waiting roster and retain that candidate in a deleted list until restored or the roster is replaced.

#### Scenario: Administrator deletes a waiting candidate
- **WHEN** the administrator activates the delete control for a candidate in the waiting roster
- **THEN** that candidate is removed from the waiting roster, appears in the deleted list, and is not included among candidates sent to start the election

### Requirement: Administrator can view deleted candidates in a right-side sheet
The system SHALL provide access to the deleted-candidate list in a side sheet that opens from the right and gives each deleted candidate an individual restore control.

#### Scenario: Administrator opens the deleted-candidate list
- **WHEN** the administrator activates the control for viewing deleted candidates
- **THEN** the system opens a sheet from the right containing the deleted candidates and a separate restore control for each candidate

#### Scenario: No candidates have been deleted
- **WHEN** the administrator opens the deleted-candidate sheet while the deleted list is empty
- **THEN** the system shows an empty state and no restore controls

### Requirement: Administrator can restore one selected deleted candidate
The system SHALL restore only the deleted candidate selected by the administrator and keep other deleted candidates in the deleted list.

#### Scenario: Administrator restores a specific candidate
- **WHEN** the administrator activates the restore control for one candidate in the deleted-candidate sheet
- **THEN** only that candidate returns to the waiting roster, its restore control is removed from the deleted list, and all other deleted candidates remain deleted

#### Scenario: Administrator starts an election with deleted candidates remaining
- **WHEN** the administrator starts an election while one or more candidates remain in the deleted list
- **THEN** only candidates in the waiting roster are published as the official roster

### Requirement: Administrator confirms before starting an election
The system SHALL require an explicit administrator confirmation before publishing the waiting roster and enabling voting.

#### Scenario: Administrator requests to start an election
- **WHEN** the administrator activates the start-election button with a non-empty waiting roster
- **THEN** the system shows a confirmation dialog with the number of candidates and does not start the election yet

#### Scenario: Administrator confirms starting the election
- **WHEN** the administrator confirms in the dialog
- **THEN** the system starts the election using the waiting roster

#### Scenario: Administrator cancels or dismisses the confirmation
- **WHEN** the administrator cancels the dialog or dismisses it with Escape
- **THEN** the system does not start the election and leaves both candidate lists unchanged
