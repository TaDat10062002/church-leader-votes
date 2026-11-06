# Spec Delta

## Purpose

Defines how an administrator deliberately clears election records after reviewing a warning, leaving the application ready to prepare a new election.

## ADDED Requirements

### Requirement: Administrator must confirm before resetting election records
The system SHALL require an administrator to confirm the permanent reset before changing election records.

#### Scenario: Administrator opens the reset confirmation
- **WHEN** an administrator selects **Bầu cử lại** on the dashboard
- **THEN** the system displays a modal stating “Mọi dữ liệu bầu cử hiện tại sẽ bị xóa vĩnh viễn và không thể hoàn tác. Xác nhận khi bạn muốn thực hiện lại cuộc bầu cử.” with **Hủy** and **Xác nhận** actions

#### Scenario: Administrator cancels the reset
- **WHEN** an administrator selects **Hủy** in the reset modal
- **THEN** the modal closes and all election records remain unchanged

### Requirement: Confirmed reset permanently clears all election table records
The system SHALL allow only an authenticated administrator to clear every row from `vote_selections`, `votes`, `candidates`, and `elections` after confirmation.

#### Scenario: Administrator confirms the reset
- **WHEN** an authenticated administrator selects **Xác nhận** and the reset succeeds
- **THEN** all rows in the four election tables are deleted, no active election remains, and the administrator can proceed to import a new roster

#### Scenario: Reset request has no valid administrator session
- **WHEN** a request attempts to reset election records without a valid administrator session
- **THEN** the system rejects the request and leaves all election records unchanged

#### Scenario: Reset operation fails
- **WHEN** the database cannot complete a confirmed reset
- **THEN** the system reports that the reset failed and leaves all four tables unchanged
