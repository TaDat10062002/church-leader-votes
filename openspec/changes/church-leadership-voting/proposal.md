# Proposal

## Why

The church needs a simple way to collect leadership votes from attendees on mobile devices and show the running totals to an administrator. The workflow should keep imported candidates provisional until the administrator starts the election, while accepting only valid ballots and updating results promptly.

## What Changes

- Build a responsive Next.js application with an Excel import page, voting page, and administrator dashboard.
- Let an administrator import candidates with required name and image columns, remove a candidate with one-step undo, and publish the remaining list when starting an election.
- Gate the administrator dashboard with the configured passcode and role; visitors without a valid administrator session go to the voting page.
- Load official candidates from Supabase for voters and accept ballots containing one to nine distinct candidates.
- Let voters build the ballot by tapping candidates once to add them to the next empty slot; provide a remove control in every filled slot and preserve the existing ballot validation and submission rules.
- Reject invalid ballots without recording them, then route a successfully recorded ballot to a dedicated “Thanks for your voting” page without a return-to-ballot action, and update ranked dashboard totals in realtime.
- Provide Supabase PostgreSQL schema SQL and environment variable examples for deployment configuration.

## Capabilities

### New Capabilities

- `election-setup`: Admin access, provisional Excel candidate import and removal/undo, and starting an election by publishing the final candidate list.
- `ballot-voting`: Display official candidates, validate and persist ballots, and acknowledge successful voting.
- `live-election-results`: Realtime vote totals and a descending chart for the administrator dashboard.

### Modified Capabilities

None.

## Impact

- New Next.js App Router pages and Route Handlers for administrator access, election setup, ballot submission, and result aggregation.
- Supabase PostgreSQL tables, constraints, transaction/RPC logic, and Realtime configuration; Supabase Storage for candidate images.
- Server-only environment configuration for Supabase credentials and administrator passcode/role. No existing application code or specifications are present in the repository.
- Excel import must handle a workbook with the required `Họ tên` and `Hình ảnh` columns. The implementation should support embedded workbook images or image URLs where practical and document any format limits.
