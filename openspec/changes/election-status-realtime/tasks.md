# Tasks

## 1. Election status schema and Realtime access

- [x] 1.1 Update the fresh schema to use `public.election_status` (`opened`, `closed`) and add an ordered migration for deployed databases; verify `open` rows migrate to `opened`, `closed` rows remain closed, and the one-open-election constraint and vote RPC checks use `opened`.
- [x] 1.2 Enable Realtime for `public.elections` and add the minimum anonymous SELECT grants and RLS policy needed for lifecycle subscriptions; update `supabase/README.md` with migration order and setup, and verify anonymous clients cannot read candidates, votes, or vote selections.

## 2. Current election snapshot and ballot guard

- [x] 2.1 Update the voter snapshot API to return the latest election `id` and `status`, including candidates only for `opened` elections; verify API coverage for opened, closed, and no-election states.
- [x] 2.2 Keep ballot submission guarded by the database `opened` check and map a closed-election rejection to the voter-facing error; verify a stale submission creates no vote or selections.

## 3. Realtime voter page

- [x] 3.1 Add a browser Supabase client using only the public URL and anon key and subscribe to election insert, update, and delete events; refresh the authoritative snapshot on subscription, events, and reconnect, and verify event payloads are not trusted as the snapshot.
- [x] 3.2 Render candidates and the ballot only for `opened`; on `closed`, unmount and clear the ballot UI and show the closed notice; verify open-to-closed, closed-to-open, and no-election transitions without a page refresh.

## 4. Integrated verification

- [x] 4.1 Verify the end-to-end lifecycle on mobile and desktop: start an election, observe the ballot, close it and observe the notice, reject an in-flight stale ballot, reopen or start an election and observe the updated ballot, then verify the page recovers after a Realtime reconnect.
