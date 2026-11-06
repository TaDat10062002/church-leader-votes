# Proposal

## Why

Administrators currently have no supported way to clear a completed election and run another one. A deliberate reset flow lets them restart while making the permanent loss of the existing election data clear before they commit.

## What Changes

- Add a **Bầu cử lại** action to the administrator dashboard.
- Require an explicit confirmation in a modal before permanently deleting all rows from `vote_selections`, `votes`, `candidates`, and `elections`.
- Provide **Hủy** and **Xác nhận** actions; canceling leaves election data unchanged. A successful reset returns the administrator to election setup so a new roster can be imported.

## Capabilities

### New Capabilities
- `election-reset`: Admin-confirmed reset of all election records so a new election can be prepared.

### Modified Capabilities

None.

## Impact

- Administrator dashboard UI and a new admin-protected reset endpoint.
- Supabase database operation that deletes records from the four existing election tables atomically and in foreign-key-safe order.
- Election-reset capability specification and setup instructions, if the database operation requires a schema update.
