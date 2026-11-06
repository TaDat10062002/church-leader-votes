-- Expose election lifecycle metadata for anonymous Realtime subscribers only.
grant select on public.elections to anon;

drop policy if exists elections_realtime_read on public.elections;
create policy elections_realtime_read
  on public.elections
  for select
  to anon
  using (true);
