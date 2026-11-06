# Design

## Context

The administrator dashboard is a client component that reads election results through an admin-protected route. Server handlers already use `requireAdmin` and the Supabase service-role client. The schema has four election tables; `vote_selections.candidate_id` restricts candidate deletion, so records must be removed in dependency order.

See `proposal.md` for the motivation and `specs/election-reset/spec.md` for the required behavior.

## Goals / Non-Goals

**Goals:**

- Make the irreversible action clear and require an explicit confirmation.
- Ensure a successful reset leaves no rows in any of the four election tables and no active election.
- Ensure a failed reset cannot leave a partial deletion.

**Non-Goals:**

- Deleting candidate image objects from Supabase Storage; the reset covers the four relational tables requested.
- Retaining or restoring a previous election after reset.

## Decisions

### Use an admin-protected endpoint and one database transaction

Add a `POST /api/admin/reset` handler that checks the existing admin session before invoking a service-role-only PostgreSQL reset function. The function locks the four tables against concurrent election writes, then deletes rows in foreign-key-safe order: `vote_selections`, `votes`, `candidates`, `elections`. PostgreSQL commits the function call atomically, so an error rolls back every deletion. A sequence of Supabase client deletes was rejected because each request could commit independently and leave a partial reset.

### Keep the confirmation in the dashboard

Add the **Bầu cử lại** button to the admin dashboard and use an accessible modal with the specified warning plus **Hủy** and **Xác nhận** actions. Cancel closes the modal without calling the endpoint. On success, clear dashboard state and navigate to `/import-file`; on failure, keep the dashboard available and show an error so the administrator can decide what to do next.

### Deliver the database function as an ordered SQL migration

Add a new SQL script after `001_schema.sql` and document its execution order in `supabase/README.md`. Grant function execution only to `service_role`, matching the existing privileged database operations. This keeps the reset atomic without broadening direct table permissions.

## Risks / Trade-offs

- [The reset permanently removes all election history] → Show the specified warning and require a separate confirmation action.
- [Concurrent ballot or election writes could race with reset] → Lock the election tables for the transaction; requests blocked by the lock resume only after the reset commits or rolls back.
- [Candidate image files may remain after their database rows are deleted] → Treat Storage cleanup as out of scope because the requested reset targets the four relational tables; document this limitation for operators.

## Migration Plan

1. Apply the new reset-function SQL script after `001_schema.sql`.
2. Deploy the admin-protected endpoint and dashboard confirmation flow.
3. Rollback by disabling the endpoint/UI and, if needed, revoke execution of the reset function from `service_role`. A reset that has already committed cannot be rolled back; export data before confirming if it must be retained.
