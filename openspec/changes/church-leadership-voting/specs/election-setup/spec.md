# Spec Delta

## Purpose

Defines how administrators access the setup flow, prepare a provisional candidate roster, and publish it as the official roster for a church leadership election.

## ADDED Requirements

### Requirement: Administrator access is gated by a passcode
The system SHALL grant the administrator dashboard only to a session established after the configured administrator role and passcode are validated on the server.

#### Scenario: Administrator enters the configured passcode
- **WHEN** a visitor submits the configured passcode and the configured role is ADMIN
- **THEN** the system establishes an administrator session and routes the visitor to the dashboard

#### Scenario: Visitor has no valid administrator session
- **WHEN** a visitor requests an administrator page without a valid administrator session
- **THEN** the system routes the visitor to the voting page

### Requirement: Candidate roster can be imported provisionally
The system SHALL accept an Excel workbook with required `Họ tên` and `Hình ảnh` columns and display its candidates as a provisional roster without adding them to the official election database.

#### Scenario: Workbook contains the required columns and candidate data
- **WHEN** an administrator imports a supported workbook
- **THEN** the system displays each parsed candidate with a name and image in the provisional roster

#### Scenario: Workbook is missing required data
- **WHEN** an administrator imports a workbook missing either required column or a candidate's required name or image
- **THEN** the system reports the import problem and does not publish the incomplete roster

### Requirement: Administrator can remove and undo a provisional candidate deletion
The system SHALL let an administrator remove a candidate from the provisional roster and undo the most recent removal before the roster is published.

#### Scenario: Administrator removes a candidate
- **WHEN** an administrator removes a candidate from the provisional roster
- **THEN** that candidate is absent from the current roster and no official candidate record is created

#### Scenario: Administrator undoes the most recent removal
- **WHEN** an administrator undoes a removal before publishing the roster
- **THEN** the most recently removed candidate is restored to the provisional roster

### Requirement: Starting an election publishes the final candidate roster
The system SHALL create an election and persist all remaining provisional candidates as its official roster only after an administrator starts the election.

#### Scenario: Administrator starts with a non-empty roster
- **WHEN** an administrator starts the election with at least one remaining candidate
- **THEN** the system publishes the roster as the active election's official candidates and makes the election available for voting

#### Scenario: Administrator starts with an empty roster
- **WHEN** an administrator attempts to start an election with no remaining candidates
- **THEN** the system reports that at least one candidate is required and creates no active election
