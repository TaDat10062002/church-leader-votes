# Spec Delta

## Purpose

Defines the public voting experience, including the official candidate list, the nine-choice ballot, validation, persistence, and confirmation after a successful submission.

## ADDED Requirements

### Requirement: Voters see official candidates from the active election
The system SHALL show voters the candidate names and images stored for the active election. On mobile, the candidate list SHALL use a compact, wrapping grid above the ballot, with each candidate's name still readable and no horizontal scrolling required.

#### Scenario: An election is active
- **WHEN** a voter opens the voting page while an election is active
- **THEN** the system displays the active election's official candidates from the database

#### Scenario: Voter opens the ballot on a mobile screen
- **WHEN** a voter opens an active election on a mobile screen
- **THEN** the system places a compact, wrapping grid of candidate buttons above the ballot, without requiring horizontal scrolling, and keeps a ballot summary available while the candidate list scrolls

#### Scenario: Voter reviews the ballot on a mobile screen
- **WHEN** a voter opens the ballot summary on a mobile screen
- **THEN** the system shows the 3-by-3 ballot in a bottom sheet with remove controls, without requiring the voter to scroll back to the ballot section

#### Scenario: No election is active
- **WHEN** a voter opens the voting page and no election is active
- **THEN** the system explains that voting is not currently available

### Requirement: Ballot contains up to nine distinct candidate selections
The system SHALL accept a ballot only when it contains at least one and no more than nine selections, with no candidate selected more than once.

#### Scenario: Voter submits a valid ballot
- **WHEN** a voter submits between one and nine distinct candidates from the active election
- **THEN** the system records one vote and its selections as a single valid ballot

#### Scenario: Voter submits an empty, duplicate, oversized, or unknown-candidate ballot
- **WHEN** a voter submits a ballot with no selection, a repeated candidate, more than nine selections, or a candidate outside the active election
- **THEN** the system explains the ballot validity rules and records no vote or selections

### Requirement: Voters select candidates with a single tap
The system SHALL let voters add an unselected candidate to the first empty ballot slot with one activation. The candidate list SHALL expose the selected state, and filled ballot slots SHALL provide a labeled remove control. Selection SHALL not require drag-and-drop or horizontal scrolling on mobile.

#### Scenario: Voter can identify how to select a candidate
- **WHEN** a voter views an active ballot
- **THEN** the system shows a visible instruction to tap a candidate once and visually distinguishes available and selected candidates

#### Scenario: Voter selects a candidate
- **WHEN** a voter activates an unselected candidate button
- **THEN** the system places that candidate in the first empty ballot slot and updates the selected state in the candidate list

#### Scenario: Voter activates a candidate already on the ballot
- **WHEN** a voter activates a candidate already selected in another slot
- **THEN** the system does not add a duplicate candidate

#### Scenario: Voter removes a candidate from a slot
- **WHEN** a voter activates the remove control for a filled ballot slot
- **THEN** the system clears that slot and makes the candidate available to select again

#### Scenario: Voter selects while all ballot slots are filled
- **WHEN** a voter attempts to select another candidate after all nine slots are filled
- **THEN** the system keeps the ballot unchanged and explains that a selection must be removed first

### Requirement: Successful ballot submission navigates to a thank-you page
After a valid ballot has been recorded, the system SHALL replace the current ballot history entry with a dedicated “Thanks for your voting” page. The thank-you page SHALL not provide a control to return to the submitted ballot.

#### Scenario: Ballot is saved successfully
- **WHEN** the system completes recording a valid ballot
- **THEN** the system navigates to the thank-you page and displays “Thanks for your voting”

#### Scenario: Voter uses browser Back after a successful submission
- **WHEN** a voter presses the browser Back button from the thank-you page
- **THEN** the submitted ballot page is not restored from the current history entry

#### Scenario: Ballot submission fails
- **WHEN** the system cannot record a submitted ballot
- **THEN** the voter remains on the ballot, receives a submission error, and is not routed to the thank-you page
