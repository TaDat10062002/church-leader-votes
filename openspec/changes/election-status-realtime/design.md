# Design

## Context

The current `public.elections.status` column is text constrained to `open` and `closed`. The active-election route returns only an open election, and `/vote` loads once without a Realtime subscription. RLS is enabled and direct access to the application tables is revoked from `anon` and `authenticated`; the browser Supabase client is not yet implemented.

See `proposal.md` and `specs/election-status/spec.md` for motivation and observable behavior.

## Goals / Non-Goals

**Goals:**

- Give election status one database type and migrate existing status values safely.
- Let the voter page react to inserts, updates, and deletes in `public.elections`.
- Keep candidate data and ballot writes behind the existing server endpoints and database RPCs.
- Recover the right UI after reconnects and missed Realtime events.

**Non-Goals:**

- Add an administrator close-election UI or change how an administrator initiates a close.
- Change vote-result Broadcast behavior or expose votes and candidate rows to anonymous clients.
- Change the ballot selection rules or election reset behavior beyond compatible status handling.

## Decisions

### Use an enum and migrate existing rows

Define a PostgreSQL enum type `public.election_status` with exactly `opened` and `closed`. Update the fresh schema, default, partial unique index, `start_election`, and `cast_vote` checks to use `opened`. Add an ordered migration for existing installations that removes the old text constraint, maps `open` to `opened`, converts the column, and recreates the one-open-election index. Preserve `closed` rows and timestamps. This keeps both new and already-deployed databases aligned; changing only the fresh-install schema would leave deployed projects incompatible.

### Return the latest election state from the voter snapshot endpoint

Change the active-election response to include the latest election's `id` and `status`, with candidates only when status is `opened`. Select the latest record by `started_at` and then `created_at`; return an explicit no-election state after reset or before the first election. Keep the service-role query on the server so candidates and all write operations remain private.

### Subscribe to election table changes with Supabase Postgres Changes

Use a browser Supabase client with the public anon key to subscribe to `INSERT`, `UPDATE`, and `DELETE` events on `public.elections`, then refresh the server snapshot rather than trusting the event payload as application state. Add `public.elections` to the Realtime publication. Realtime delivery must be allowed by a narrow RLS `SELECT` policy and grants for election metadata; the table currently contains only election identifiers, status, and lifecycle timestamps. Keep RLS and grants for `candidates`, `votes`, and `vote_selections` private. This direct table subscription is simpler than adding another trigger-and-Broadcast pathway for a single small lifecycle table; Broadcast remains suitable for the existing vote-result notifications.

Subscribe before relying on the initial snapshot, refresh once the subscription is established, on each election event, and after reconnect. This closes the gap between the initial request and subscription setup and recovers from missed events. When the refreshed state is `closed`, unmount the ballot builder so any unsent local selections are discarded; when state becomes `opened`, render candidates returned by the server.

### Keep the database authoritative for ballot acceptance

Update `cast_vote` to accept only `opened` elections. Realtime controls presentation, but a voter can submit with a stale tab or race a close event, so the RPC remains the final guard and must reject a closed election without inserting vote data. The page displays the closed notice after it refreshes its snapshot.

## Risks / Trade-offs

- [Allowing anonymous Realtime reads adds visibility into election lifecycle metadata] → Limit the policy and grants to `public.elections`, which contains no candidate names, ballots, or voter identity; retain server-only candidate reads and writes.
- [Realtime can disconnect or miss a change] → Refresh on subscription, reconnect, and every event; keep the database snapshot authoritative.
- [Existing installations use text values and indexes] → Provide an ordered migration that maps `open` to `opened` and replaces the old partial index as part of the conversion.
- [An election can close while a ballot is being submitted] → Recheck status transactionally in `cast_vote`; a rejected submission creates no vote or selections.

## Migration Plan

1. Update the fresh-install schema to define `election_status`, default new elections to `opened`, and use the new value in indexes and RPCs.
2. Add a forward migration for existing projects, preserving closed elections and mapping `open` to `opened` before converting the column.
3. Configure the `elections` table for Realtime and grant anonymous clients only the read access needed to receive lifecycle events.
4. Deploy the updated voter snapshot response and Realtime subscription. Verify an open, close, reopen, reset, reconnect, and stale ballot submission flow.

Rollback by disabling the voter subscription and restoring the previous application version. Database rollback requires converting `opened` back to `open` before restoring the text constraint and prior index; preserve closed rows and vote data.
