# Church Leadership Voting

A mobile-first church election app built with Next.js App Router and Supabase. Admins import an `.xlsx` roster, review and edit the provisional list, and start the election. Voters drag one to nine distinct candidates into a 3-by-3 ballot. The dashboard shows descending totals and refreshes from election-specific Realtime Broadcast notifications.

## Languages

The interface supports Vietnamese and Traditional Chinese. Vietnamese is the default; use the language control beside the appearance controls to switch languages. The selection is stored in a browser cookie and applies across routes and reloads. Candidate names and other election data remain as entered.

## Local setup

1. Install Node.js 20 or later, then install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and fill in the Supabase project URL, public anon key, server service-role key, admin passcode, and a long random session secret. The example passcode is `1234`; replace it before deployment. Never prefix the service-role key or admin secrets with `NEXT_PUBLIC_`.
3. In the Supabase SQL Editor, run `supabase/sql/001_schema.sql`. This creates the election schema, RLS protections, atomic start/vote RPCs, and the public `candidate-images` Storage bucket. Optionally run `supabase/sql/002_smoke_test.sql`; its fixture changes are rolled back.
4. In Supabase project settings, ensure Realtime is enabled. After a vote commits, the server sends a REST Broadcast using `httpSend` to the public channel named `election-<election UUID>` with the `vote-recorded` event; the event contains only the election ID and never ballot selections. No table replication/publication is required for this Broadcast design.
5. Start the app with `npm run dev`. Open `/admin` to enter the configured PIN, then use `/import-file` to import a roster. The voter page is `/vote`; the protected results dashboard is `/dashboard`.

## Environment variables

| Name | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL; needed by the browser for Realtime and the server for database access. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public key used only for the dashboard's Realtime client. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key used by Route Handlers for Storage and privileged database RPCs. |
| `ADMIN_ROLE` | Must be `ADMIN` for admin PIN authentication. |
| `ADMIN_PASSCODE` | Shared administrator PIN. |
| `ADMIN_SESSION_SECRET` | Random signing secret for the HttpOnly admin session cookie; use at least 32 characters. |

Set the same variables in the deployment provider's server environment. Keep the service-role key, passcode, and session secret private. The example `.env.local` file is ignored by Git; use `.env.example` as the safe template.

## Workbook and images

The import page includes a **Tải Excel mẫu** download with the required columns and a short instruction sheet. Import the first worksheet of a `.xlsx` workbook. The first row must include `Họ tên` and `Hình ảnh` columns. Each non-empty candidate row needs a name and either a JPG/PNG/WEBP image embedded and anchored in its `Hình ảnh` cell or an `http(s)` image URL. Blank rows are ignored. Workbooks over 10 MB and embedded images over 5 MB are rejected. Candidates remain provisional in the browser until Start; embedded image files are uploaded to the `candidate-images` public bucket immediately before the database creates the election and candidate rows.

## Verification and build

The interface uses WebsiteGlass source components and Tailwind CSS 4. See
[the UI integration notes](docs/liquid-glass.md) for component coverage, local
adaptations, and browser fallbacks.

- `npm test` runs unit tests and applies the SQL schema plus rollback smoke test to a fresh local PGlite database.
- `npm run build` creates the production build.
- `npm run test:e2e` runs browser interaction tests against a running production server at `http://127.0.0.1:4173`; these tests stub election and vote APIs and do not write to Supabase. Set `PLAYWRIGHT_EXECUTABLE_PATH` if Playwright's bundled browser is unavailable.

To close an active election manually, run `update public.elections set status = 'closed', closed_at = now() where status = 'open';` in the Supabase SQL Editor. Keep the vote tables if the results need to be retained.

Anonymous voting intentionally does not enforce one ballot per person. Anyone who can access the voter page can submit another valid ballot.
