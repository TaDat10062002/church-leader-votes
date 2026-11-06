-- Run this file in the Supabase SQL Editor for a new project.
create extension if not exists pgcrypto;

create table if not exists public.elections (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now(),
  started_at timestamptz not null default now(),
  closed_at timestamptz
);
create unique index if not exists elections_one_open_idx on public.elections ((status)) where status = 'open';

create table if not exists public.candidates (
  id uuid primary key default gen_random_uuid(),
  election_id uuid not null references public.elections(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  image_url text not null check (length(trim(image_url)) > 0),
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (election_id, display_order)
);
create index if not exists candidates_election_idx on public.candidates(election_id, display_order);

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  election_id uuid not null references public.elections(id) on delete cascade,
  submitted_at timestamptz not null default now()
);
create index if not exists votes_election_idx on public.votes(election_id, submitted_at desc);

create table if not exists public.vote_selections (
  id uuid primary key default gen_random_uuid(),
  vote_id uuid not null references public.votes(id) on delete cascade,
  candidate_id uuid not null references public.candidates(id) on delete restrict,
  slot_number integer not null check (slot_number between 1 and 9),
  unique (vote_id, candidate_id),
  unique (vote_id, slot_number)
);
create index if not exists vote_selections_candidate_idx on public.vote_selections(candidate_id);

alter table public.elections enable row level security;
alter table public.candidates enable row level security;
alter table public.votes enable row level security;
alter table public.vote_selections enable row level security;
revoke all on public.elections, public.candidates, public.votes, public.vote_selections from anon, authenticated;

-- A public bucket serves candidate portraits. Only the server service-role key uploads/deletes files.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('candidate-images', 'candidate-images', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp'];

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
  if exists (select 1 from public.elections where status = 'open') then
    raise exception 'ELECTION_ALREADY_OPEN' using errcode = '23505';
  end if;

  insert into public.elections(status) values ('open') returning id into v_election_id;
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
  if not exists (select 1 from public.elections where id = p_election_id and status = 'open') then
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

revoke all on function public.start_election(jsonb) from public, anon, authenticated;
revoke all on function public.cast_vote(uuid, uuid[]) from public, anon, authenticated;
grant execute on function public.start_election(jsonb) to service_role;
grant execute on function public.cast_vote(uuid, uuid[]) to service_role;

-- Aggregate query used by the server result route:
-- select c.id, c.name, c.image_url, count(s.id)::integer as total
-- from public.candidates c left join public.vote_selections s on s.candidate_id = c.id
-- where c.election_id = :election_id group by c.id order by total desc, c.name asc;
