# Spec Delta

## Purpose

Defines the public voting experience, including the official candidate list, the nine-choice ballot, validation, persistence, and confirmation after a successful submission.

## ADDED Requirements

### Requirement: Voters see official candidates from the active election
The system SHALL show voters the candidate names and images stored for the active election. On mobile, the candidate list SHALL use a compact row of small circular avatars above the ballot, with each candidate's name still readable.

#### Scenario: An election is active
- **WHEN** a voter opens the voting page while an election is active
- **THEN** the system displays the active election's official candidates from the database

#### Scenario: Voter opens the ballot on a mobile screen
- **WHEN** a voter opens an active election on a mobile screen
- **THEN** the system places a compact row of small circular candidate icons above a compact 3-by-3 ballot grid

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

### Requirement: Voters place candidates onto the ballot with drag and drop
The system SHALL let voters drag compact circular candidate icons into the nine ballot slots, clearly communicate the drag action, and support touch and keyboard interaction without requiring numeric entry.

#### Scenario: Voter can identify how to fill an empty slot
- **WHEN** a voter views an active ballot
- **THEN** the system shows a visible instruction to drag a candidate icon into an empty numbered slot and visually distinguishes the icons as draggable

#### Scenario: Voter drags a candidate into an empty slot
- **WHEN** a voter drags an unselected candidate card onto an empty ballot slot using a mouse, touch, or keyboard
- **THEN** the system places that candidate in the target slot and updates the selected state in the candidate list

#### Scenario: Voter tries to add a duplicate candidate
- **WHEN** a voter drags a candidate already present in another slot onto the ballot
- **THEN** the system does not add a duplicate and explains that candidates may only appear once

#### Scenario: Voter removes a candidate from a slot
- **WHEN** a voter activates the remove control for a filled ballot slot
- **THEN** the system clears that slot and makes the candidate available to drag into a slot again

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
