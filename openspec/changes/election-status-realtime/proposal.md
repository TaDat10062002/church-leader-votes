# Proposal

## Why

The voter page only checks for an open election when it first loads, so it can keep showing a ballot after an administrator closes voting. A consistent election status enum and realtime updates will make the voter interface reflect the current election state immediately.

## What Changes

- Replace the `elections.status` text constraint with a PostgreSQL enum containing `opened` and `closed`, including a migration from existing `open` and `closed` values.
- Have the voter page receive the current election state and subscribe to Supabase Realtime changes for elections.
- Show candidates and the ballot while an election is `opened`; hide them and show a closed-election notice when it is `closed`.
- Keep ballot acceptance enforced by the database so a close event cannot be bypassed by a stale page.

## Capabilities

### New Capabilities

- `election-status`: Election lifecycle status and realtime voter-page behavior based on the current status.

### Modified Capabilities

None. The repository has no main specs yet; this change introduces the first durable capability spec for election status.

## Impact

- Supabase `elections` schema, election creation and ballot RPCs, and SQL migration/setup documentation.
- The active-election API and voter page, with a public-safe Supabase Realtime subscription to election changes.
- Existing stored `open` values must be converted to `opened` when applying the migration.
