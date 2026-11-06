# Tasks

## 1. Database reset operation

- [x] 1.1 Add an ordered SQL migration with a service-role-only reset function that locks and clears `vote_selections`, `votes`, `candidates`, and `elections` in foreign-key-safe order; verify a successful call leaves each table empty and a failed call rolls back all deletions.
- [x] 1.2 Document the migration order, permanent deletion behavior, and candidate image storage limitation in `supabase/README.md`; verify the documented setup order matches the SQL files.

## 2. Administrator reset flow

- [x] 2.1 Add `POST /api/admin/reset`, require a valid administrator session, and invoke the reset function; verify requests without a session are rejected and an authorized reset reports success only after the database operation completes.
- [x] 2.2 Add the **Bầu cử lại** dashboard action and accessible confirmation modal with the specified warning, **Hủy**, and **Xác nhận**; verify cancel makes no request, success returns to `/import-file`, and failures show an error without implying the reset succeeded.
- [x] 2.3 Verify the complete administrator flow with existing election data: cancel preserves all four tables, confirm clears them, dashboard state is cleared, and a new roster can be imported.
