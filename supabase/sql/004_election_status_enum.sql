-- Convert the existing text status column after applying 001_schema.sql.
-- Safe to apply after the updated fresh schema as well as the legacy schema.
do $$ begin
  create type public.election_status as enum ('opened', 'closed');
exception when duplicate_object then null;
end $$;

drop index if exists public.elections_one_open_idx;

do $$
declare
  status_type text;
begin
  select udt_name into status_type
  from information_schema.columns
  where table_schema = 'public' and table_name = 'elections' and column_name = 'status';

  if status_type = 'text' then
    alter table public.elections drop constraint if exists elections_status_check;
    alter table public.elections alter column status drop default;
    alter table public.elections
      alter column status type public.election_status
      using (case status when 'open' then 'opened' else status end)::public.election_status;
  elsif status_type <> 'election_status' then
    raise exception 'Unexpected public.elections.status type: %', status_type;
  end if;
end $$;

alter table public.elections alter column status set default 'opened'::public.election_status;
create unique index elections_one_open_idx on public.elections ((status)) where status = 'opened';

create or replace function public.start_election(p_candidates jsonb)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_election_id uuid;
  v_count integer;
begin
  if jsonb_typeof(p_candidates) <> 'array' then
    raise exception 'CANDIDATES_MUST_BE_ARRAY' using errcode = '22023';
  end if;
  v_count := jsonb_array_length(p_candidates);
  if v_count < 1 then
    raise exception 'CANDIDATE_REQUIRED' using errcode = '22023';
  end if;
  if exists (
    select 1 from jsonb_array_elements(p_candidates) as candidate(value)
    where nullif(trim(candidate.value->>'name'), '') is null or nullif(trim(candidate.value->>'image_url'), '') is null
  ) then
    raise exception 'CANDIDATE_NAME_AND_IMAGE_REQUIRED' using errcode = '22023';
  end if;
  if exists (select 1 from public.elections where status = 'opened') then
    raise exception 'ELECTION_ALREADY_OPEN' using errcode = '23505';
  end if;

  insert into public.elections(status) values ('opened') returning id into v_election_id;
  insert into public.candidates(election_id, name, image_url, display_order)
  select v_election_id, trim(c->>'name'), trim(c->>'image_url'), ordinality::integer
  from jsonb_array_elements(p_candidates) with ordinality as rows(c, ordinality);
  return v_election_id;
end;
$$;

create or replace function public.cast_vote(p_election_id uuid, p_candidate_ids uuid[])
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_vote_id uuid;
  v_count integer;
  v_distinct integer;
  v_matches integer;
begin
  if p_candidate_ids is null then
    raise exception 'BALLOT_EMPTY' using errcode = '22023';
  end if;
  v_count := coalesce(array_length(p_candidate_ids, 1), 0);
  if v_count < 1 or v_count > 9 then
    raise exception 'BALLOT_SIZE_INVALID' using errcode = '22023';
  end if;
  select count(distinct id)::integer into v_distinct from unnest(p_candidate_ids) as id;
  if v_distinct <> v_count then
    raise exception 'DUPLICATE_CANDIDATE' using errcode = '22023';
  end if;
  if not exists (select 1 from public.elections where id = p_election_id and status = 'opened') then
    raise exception 'ELECTION_NOT_OPEN' using errcode = '22023';
  end if;
  select count(*)::integer into v_matches from public.candidates
  where election_id = p_election_id and id = any(p_candidate_ids);
  if v_matches <> v_count then
    raise exception 'CANDIDATE_NOT_IN_ELECTION' using errcode = '22023';
  end if;

  insert into public.votes(election_id) values (p_election_id) returning id into v_vote_id;
  insert into public.vote_selections(vote_id, candidate_id, slot_number)
  select v_vote_id, candidate_id, ordinality::integer
  from unnest(p_candidate_ids) with ordinality as rows(candidate_id, ordinality);
  return v_vote_id;
end;
$$;
