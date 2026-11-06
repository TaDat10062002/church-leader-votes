-- Add elections to Supabase's Postgres Changes publication, idempotently.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'elections'
  ) then
    alter publication supabase_realtime add table public.elections;
  end if;
end $$;
