# Tasks

## 1. Application foundation

- [x] 1.1 Scaffold the Next.js App Router application, Tailwind CSS, shadcn/ui, and responsive shared layout; verify the development server starts and the three route entry points render with the shared theme.
- [x] 1.2 Add Supabase server/client configuration and `.env.example` with server-only secret names and safe placeholders; verify no service key is exposed in browser output and document required Supabase setup values.

## 2. Supabase schema and data access

- [x] 2.1 Add ordered SQL scripts for elections, candidates, votes, vote selections, indexes, constraints, RLS policies, and the atomic ballot RPC; verify scripts apply cleanly to a fresh Supabase PostgreSQL project.
- [x] 2.2 Add image bucket/setup instructions and document how to run the SQL scripts in Supabase; verify a candidate image can be stored and read by the voter experience.
- [x] 2.3 Add database-level checks for ballot limits, duplicate candidate/slot rejection, election membership, and transaction rollback; verify invalid ballots leave zero vote and selection rows.

## 3. Administrator setup and candidate import

- [x] 3.1 Implement server-side passcode/role validation and signed administrator session cookies; verify valid credentials reach the dashboard and missing/invalid sessions route to voting.
- [x] 3.2 Implement `.xlsx` parsing for required `Họ tên` and `Hình ảnh` columns, including supported image inputs and row validation; verify malformed workbooks show actionable errors and do not create official candidates.
- [x] 3.3 Implement provisional candidate display, removal, one-step undo, and image upload; verify edits remain provisional until election start and undo restores the last removed candidate.
- [x] 3.4 Implement atomic election and official-candidate creation on Start; verify an empty roster is rejected and a non-empty roster is persisted as the active election.
- [x] 3.5 Add automated coverage for admin session and import/undo flows and document supported workbook/image formats; verify the documented format matches parser behavior.

## 4. Public ballot voting

- [x] 4.1 Implement the mobile-first voter page loading official candidates from the active election, with a compact wrapping grid of tappable candidate buttons above the ballot; verify no provisional candidates appear and the no-active-election state is clear on mobile and desktop.
- [x] 4.2 Implement the compact 3-by-3 ballot with single-tap candidate selection, first-empty-slot placement, a persistent mobile ballot summary, bottom-sheet review and removal controls, and server-side validation for one to nine distinct active-election candidates; verify the selection flow and reject empty, duplicate, oversized, and unknown-candidate ballots without database writes.
- [x] 4.3 Connect valid ballot submission to the atomic database RPC and navigate with history replacement to a dedicated “Thanks for your voting” page only after commit; verify a successful ballot stores one vote with its selections, the thank-you page has no return action, and browser Back does not restore the submitted ballot.
- [x] 4.4 Add automated coverage for valid/invalid submissions and document that anonymous voting does not enforce one vote per person; verify these behaviors match the voter-facing flow.

## 5. Live results dashboard

- [x] 5.1 Implement the admin-protected aggregate results handler and responsive Recharts vertical chart with candidate avatars/names, sorted by total descending with a stable tie-breaker; verify every official candidate appears, including candidates with zero votes, and labels remain usable on narrow screens.
- [x] 5.2 Publish minimal election-specific Realtime notifications after successful commits and subscribe/refetch from the dashboard; verify a valid vote updates totals without refresh and invalid ballots do not change the chart.
- [x] 5.3 Add automated coverage for aggregation, ordering, and realtime refresh, and document reconnect/focus recovery; verify the dashboard restores current totals after a missed notification.

## 6. Integrated delivery

- [ ] 6.1 Run the application build and end-to-end flow from admin import through vote submission to live dashboard update; verify all required routes work on mobile and desktop viewports.
- [x] 6.2 Complete deployment/setup documentation for environment variables, SQL execution order, storage, and realtime configuration; verify a fresh setup can follow the documented steps.
