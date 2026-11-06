# Design

## Context

See `proposal.md` for the motivation and `specs/election-setup/spec.md` for the required behavior. The import screen currently stores the provisional roster and a single last-deleted candidate in React state. The project has `Button` and `Card` UI primitives but no Sheet primitive or dialog dependency.

## Goals / Non-Goals

**Goals:**

- Keep multiple deleted candidates available for independent restoration during the current import session.
- Preserve candidate identity and original roster order when candidates are deleted and restored.
- Keep the election start request limited to the waiting roster.
- Provide the requested right-side Sheet using the project's shadcn/ui component style.

**Non-Goals:**

- Persist provisional or deleted candidates across page reloads.
- Change workbook parsing, server APIs, or the database schema.
- Add bulk restore or permanent-delete actions.

## Decisions

### Track waiting and deleted candidates as separate client-side collections

Represent each imported row with a stable client-side ID, its candidate data, and its original import position. Keep active entries in the waiting roster and move deleted entries to a separate collection. Restoring an entry moves only that ID back to the waiting roster at its original relative position. The stable ID keeps two candidates with the same name independently addressable; the original position preserves the existing single-undo ordering behavior when several rows are restored in a different order. Strip the client-only ID and position before sending the start request, which contains only waiting candidate data. A new workbook import resets both collections.

An alternative was to key entries by name or image URL, but either value can be shared by distinct candidates. A single last-deleted pointer cannot support several outstanding deletions or per-candidate restoration.

### Use an accessible shadcn/ui Sheet that enters from the right

Add the Sheet primitive under `src/components/ui` using the project's shadcn/ui conventions and the Radix Dialog dependency it requires, since neither is currently present. Put the deleted roster inside the Sheet, provide a visible candidate count and empty state, and give each deleted row its own restore button. Keep the Sheet open after a restore so the administrator can restore additional candidates without reopening it; allow the normal close controls and Escape key to dismiss it.

A custom non-modal panel would avoid a dependency but would require recreating focus management, keyboard dismissal, and screen-reader dialog behavior. The Radix-backed Sheet provides those behaviors and matches the requested component.

### Keep removal and restoration controls next to their respective lists

Each waiting-roster card keeps its delete button. A separate control in the waiting-list heading opens the deleted-candidate Sheet and can show the deleted count. Each row in the Sheet restores only that candidate. Remove the shared last-item undo action because it conflicts with individual restoration.

## Risks / Trade-offs

- [A local ID could accidentally be sent to the start API] → Map waiting entries back to candidate data when building the request body, and cover the payload with a test.
- [Several restored candidates could be inserted in the wrong order] → Store the original import position and test restoring candidates in a different order from deletion.
- [The Sheet adds a UI dependency] → Use the Radix Dialog package required by shadcn/ui and keep its usage limited to this accessible panel.

## Migration Plan

No data migration is needed because both lists remain client-side and the start API continues to receive only candidate data. Replace the current undo state and notification, add the Sheet primitive and dependency, then verify roster-state behavior and the import flow. Rollback by reverting the UI/state change and dependency; no persisted election data is affected.
