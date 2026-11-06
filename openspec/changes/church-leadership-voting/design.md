# Design

## Context

The repository has no application source yet. This change introduces a Next.js App Router application connected to Supabase. See `proposal.md` for the user need and the capability specs for observable behavior.

## Goals / Non-Goals

**Goals:**

- Keep administrator credentials and Supabase service credentials server-side.
- Ensure a submitted ballot and all its selections are stored atomically and totals count each selected candidate once per ballot.
- Keep candidate images in Supabase Storage and candidate metadata in PostgreSQL.
- Deliver runnable SQL scripts for creating the schema and its required policies/indexes.

**Non-Goals:**

- Voter accounts, voter identity collection, or enforcing one ballot per attendee.
- Complex role management, multiple administrator accounts, or a full authentication provider.
- Anonymous public access to detailed ballot selections or administrator result APIs.

## Decisions

### Next.js Route Handlers own trusted operations

Use App Router pages for the import, vote, and dashboard experiences. Route Handlers validate administrator sessions, publish elections, accept ballots, and compute aggregates. Use the Supabase JavaScript SDK from server code for privileged operations; keep the service role key out of browser bundles. This gives one trusted validation path and avoids letting an unauthenticated browser insert arbitrary database records.

### Minimal server-managed administrator session

Read `ADMIN_ROLE` and `ADMIN_PASSCODE` from server-only environment variables. After matching both expected configuration values, issue a short-lived, signed, HttpOnly, Secure-in-production, SameSite cookie using a separate `ADMIN_SESSION_SECRET`. Dashboard and admin handlers verify that cookie on every request. Missing or invalid sessions redirect to the vote page. Do not store a passcode or role flag in local storage or trust client-supplied role values.

### Provisional roster remains in browser memory

Parse the workbook on the import page and keep candidate rows plus the most recently deleted row in client state. No candidate records are written to PostgreSQL before the administrator starts the election. At start, upload images to a private or public candidate-image bucket as appropriate for voter display, then call one server endpoint to create the election and all candidates in a database transaction. If database creation fails after image upload, attempt to remove those newly uploaded objects.

Support `.xlsx` with the required `Họ tên` and `Hình ảnh` headers. Accept embedded workbook images associated with rows and image URLs; document any parser limitations. Reject rows without a usable name or image before enabling start.

### Relational schema and atomic ballot RPC

Provide SQL scripts under `supabase/sql/` and document execution order. Use these tables:

- `elections`: UUID, status (`open`/`closed`), creation/start timestamps. Enforce at most one open election with a partial unique index.
- `candidates`: UUID, `election_id`, name, image URL/storage path, display order, creation timestamp.
- `votes`: UUID, `election_id`, submission timestamp. One row represents one successfully submitted ballot.
- `vote_selections`: UUID, `vote_id`, `candidate_id`, slot number 1-9.

Add uniqueness constraints on `(vote_id, candidate_id)` and `(vote_id, slot_number)`, plus a check constraint for slot range. A server-only PostgreSQL function validates that the election is open, there are 1-9 distinct selections, and every candidate belongs to that election; it inserts the vote and selections in one transaction. Invalid submissions raise a controlled validation error and leave no rows behind. Aggregates count rows in `vote_selections` per candidate.

Enable RLS and deny direct anonymous writes. The server Route Handlers use the service key after performing the relevant checks. Public candidate reads expose only the active election's names and image URLs through a narrowly scoped query/handler. Admin aggregate endpoints require the signed admin cookie.

### Realtime uses a minimal notification and trusted aggregate refresh

After the ballot RPC commits, the server publishes a `vote-recorded` notification with Supabase Realtime's REST `httpSend` API on an election-specific Broadcast channel. It does not keep a server WebSocket subscription just to send the event. The dashboard subscribes and refetches aggregate totals from the admin-protected results handler, then sorts by total descending with candidate name as the stable tie-breaker. The notification carries no ballot selections or voter data. Refresh the snapshot on reconnect and window focus to recover from missed notifications. If notification delivery fails after the database commit, keep the ballot successful and rely on the dashboard's reconnect/focus refresh rather than inviting a duplicate ballot retry.

### Mobile-first pages

Use Tailwind CSS for responsive styling and shadcn/ui components for accessible buttons, cards, dialogs, alerts, and toasts. This keeps the UI consistent while allowing the church's colors and typography to be customized; a larger prescriptive UI kit would add more styling weight and limit that flexibility. Use Recharts for the responsive dashboard chart.

Use `@dnd-kit/core` for drag-and-drop across mouse, touch, and keyboard input. On mobile, show the candidates first as a compact, horizontally scrollable row of small circular avatars with short names underneath; keep a visible grip/drag cue and selected state so each icon reads as draggable. Place the compact nine-slot ballot directly below in a 3-by-3 grid, with a short instruction and a clear “Thả vào đây” affordance on empty slots. Highlight valid slots while dragging and show a drag overlay so the moved candidate stays visible above the page. A selected candidate cannot be added to another slot; each filled slot has a labeled remove button that returns that candidate to the available list. Configure touch activation to distinguish a deliberate drag from normal page scrolling, and provide keyboard sensor controls for accessibility. Keep the submit button prominent and easy to reach, and give errors and submission progress visible space. On wider screens, let the circular candidate list wrap across the available width while keeping the ballot compact. Use hover only for a subtle visual scale effect, never as the only drag cue.

For admin setup, show a clear Excel upload area, a preview of imported candidates, an undo toast/action after deletion, and a visually prominent Start button. On the dashboard, use a vertical Recharts bar chart sorted from highest to lowest count, with candidate names and circular avatars under the bars. Keep labels legible and allow horizontal scrolling when many candidates exceed the screen width. After the server confirms a ballot commit, navigate to a dedicated `/thanks` page with `router.replace` so browser Back does not reopen the submitted ballot. The page shows “Thanks for your voting” and offers no action that returns to voting.

### Environment and SQL delivery

Commit `.env.example` with variable names and safe placeholders, not actual secrets. Include SQL scripts and brief setup instructions for Supabase project values, Storage bucket setup, and enabling Realtime Broadcast. The actual `.env.local` values are supplied by the project owner later.

## Risks / Trade-offs

- [Embedded Excel images may not map cleanly to rows in every workbook format] → Support the agreed `.xlsx` structure, validate row-image association, and report unsupported workbooks before publishing.
- [An environment passcode is a low-friction shared secret and can be forwarded] → Keep it server-only, add a basic attempt limit, use a signed expiring cookie, and document that it is not individual identity verification.
- [Storage uploads and PostgreSQL transactions cannot share one atomic transaction] → Upload first, create database rows transactionally, and clean up uploaded files on failure; tolerate and document cleanup retries.
- [Realtime notifications can be missed during disconnection] → Refetch on reconnect/focus and after subscription establishment; the database aggregate remains authoritative.
- [A submitter can send repeated valid ballots because voters are anonymous] → This matches the requested no-login flow; do not claim one-person-one-vote.

## Migration Plan

1. Create the Supabase tables, constraints, function, RLS policies, publication/channel configuration, and Storage bucket by running the provided SQL/setup steps.
2. Add server environment variables and verify the admin passcode session.
3. Deploy the Next.js application and start an election with a test roster.
4. Validate a ballot end-to-end, confirm invalid ballots leave no database rows, and observe the dashboard update.

Rollback by disabling the application deployment and closing the active election through the documented SQL operation. Retain or export vote data before dropping any schema objects.
