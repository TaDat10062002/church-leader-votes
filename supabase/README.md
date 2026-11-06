# Supabase setup

1. Create a Supabase project and run `sql/001_schema.sql` in its SQL Editor. On a fresh project, optionally run `sql/002_smoke_test.sql`; it tests valid and invalid ballots and rolls back its fixture rows.
2. The script creates the tables, constraints, private-by-default row access, the atomic `start_election` and `cast_vote` functions, and a public-read `candidate-images` Storage bucket. Upload and database write requests are made only by server Route Handlers using the service-role key.
3. Copy `.env.example` to `.env.local` and fill in the project URL, anonymous key, service-role key, administrator passcode, and session signing secret. Never expose the service-role key or admin secrets with a `NEXT_PUBLIC_` prefix.
4. Enable Realtime for the Supabase project. After the vote RPC commits, the server sends a REST Broadcast through `httpSend` to the election-specific public channel. The message contains only a change notification, never ballot selections. No `votes` table replication is needed. The dashboard fetches aggregate counts through an admin-protected Route Handler and refreshes after a new vote, after reconnecting, and when the administrator returns to the browser tab.

## Excel workbook format

The import page's **Tải Excel mẫu** button downloads a workbook with the required header row and a separate instruction sheet. Import the first worksheet of a `.xlsx` workbook. Row 1 must contain `Họ tên` and `Hình ảnh` headers. Each subsequent non-empty candidate row needs a name and either an image anchored in that row's `Hình ảnh` cell (JPG, PNG, or WEBP) or an `http(s)` image URL in the cell. Blank rows are ignored; incomplete candidate rows are reported and prevent import. Workbooks larger than 10 MB and images larger than 5 MB are rejected. Images remain provisional in the browser until Start uploads them.

Run `npm test` to execute the local ballot validation, aggregate ordering, workbook parsing, and provisional undo unit tests.

To close an election manually, run `update public.elections set status = 'closed', closed_at = now() where status = 'open';`. Keep the vote tables intact if results must be retained.
