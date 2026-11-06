# Proposal

## Why

The import page currently keeps only the most recently deleted candidate and offers a shared undo action, so administrators cannot review or restore several removed candidates independently. A dedicated deleted-candidate list makes each removal visible and lets the administrator restore exactly the intended person before publishing the roster.

## What Changes

- Keep deleted provisional candidates separately from the waiting roster.
- Add a control for viewing deleted candidates in a shadcn/ui Sheet that opens from the right.
- Give every waiting candidate a delete button and every deleted candidate its own restore button.
- Publish only candidates remaining in the waiting roster when the election starts.

## Capabilities

### New Capabilities
- `election-setup`: Import a provisional candidate roster, manage deleted candidates, restore each candidate individually, and publish the remaining roster.

### Modified Capabilities

None.

## Impact

- Update the import roster UI and client-side roster state.
- Add or install the shadcn/ui Sheet primitive and its required dialog dependency if needed.
- Extend roster state tests and add UI coverage for opening the deleted list, per-candidate restore, and publishing only the waiting roster.
