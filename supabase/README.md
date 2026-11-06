# Supabase setup

1. Create a Supabase project and run `sql/001_schema.sql` in its SQL Editor. It creates `elections.status` as the `public.election_status` enum (`opened`, `closed`). On a fresh project, optionally run `sql/002_smoke_test.sql`; it tests valid and invalid ballots and rolls back its fixture rows.
2. Run `sql/003_reset_election.sql` after `001_schema.sql` to install the administrator reset function.
3. Run `sql/004_election_status_enum.sql`, `sql/005_election_realtime_access.sql`, and `sql/006_election_realtime_publication.sql` in order. The enum migration is safe on both legacy text columns and fresh enum columns. The access script grants anonymous read access to election lifecycle metadata only; candidate and vote tables remain private. The publication script enables Postgres Changes for elections.
4. Existing projects that previously ran `001_schema.sql` should apply `003_reset_election.sql` if needed, then run `004`, `005`, and `006` in order to migrate status and enable lifecycle Realtime.
5. The scripts create the tables, constraints, private-by-default row access, the atomic `start_election`, `cast_vote`, and `reset_election` functions, and a public-read `candidate-images` Storage bucket. Uploads and database writes are made only by server Route Handlers using the service-role key.
6. Copy `.env.example` to `.env.local` and fill in the project URL, anonymous key, service-role key, administrator passcode, and session signing secret. Never expose the service-role key or admin secrets with a `NEXT_PUBLIC_` prefix.
7. After the vote RPC commits, the server sends a REST Broadcast through `httpSend` to the election-specific public channel. The message contains only a change notification, never ballot selections. No `votes` table replication is needed. The dashboard fetches aggregate counts through an admin-protected Route Handler and refreshes after a new vote, after reconnecting, and when the administrator returns to the browser tab. The voter page subscribes to `public.elections` changes and refetches the server snapshot on subscription, status changes, and reconnect.

## Resetting an election

The administrator dashboard's **Bầu cử lại** action requires confirmation before it permanently deletes every row from `vote_selections`, `votes`, `candidates`, and `elections`. Apply `sql/003_reset_election.sql` after `001_schema.sql`; the server invokes the function only after validating the administrator session. The deletion cannot be undone, so export any records that must be retained before confirming. Candidate image objects in the `candidate-images` Storage bucket are not deleted by this reset and may remain after their database rows are removed.

## Excel workbook format

The import page's **Tải Excel mẫu** button downloads a workbook with the required header row and a separate instruction sheet. Import the first worksheet of a `.xlsx` workbook. Row 1 must contain `Họ tên` and `Hình ảnh` headers. Each subsequent non-empty candidate row needs a name and either an image anchored in that row's `Hình ảnh` cell (JPG, PNG, or WEBP) or an `http(s)` image URL in the cell. Blank rows are ignored; incomplete candidate rows are reported and prevent import. Workbooks larger than 10 MB and images larger than 5 MB are rejected. Images remain provisional in the browser until Start uploads them.

Run `npm test` to execute the local ballot validation, aggregate ordering, workbook parsing, and provisional undo unit tests.

To close an election manually, run `update public.elections set status = 'closed', closed_at = now() where status = 'opened';`. Keep the vote tables intact if results must be retained.
