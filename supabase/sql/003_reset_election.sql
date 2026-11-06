-- Permanently removes every election record. Execute only through the
-- admin-protected server route using the service-role key.
create or replace function public.reset_election()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- Serialize reset against ballot and election writes.
  lock table public.elections, public.candidates, public.votes, public.vote_selections
    in access exclusive mode;

  -- Supabase safeupdate requires a WHERE clause even for this intentional full reset.
  delete from public.vote_selections where true;
  delete from public.votes where true;
  delete from public.candidates where true;
  delete from public.elections where true;
end;
$$;

revoke all on function public.reset_election() from public, anon, authenticated;
grant execute on function public.reset_election() to service_role;
