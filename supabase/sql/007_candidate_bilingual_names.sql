-- Existing single-name candidate data must be cleared by the administrator first.
-- No legacy names are assigned to a language or deleted by this migration.
begin;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'candidates' and column_name = 'name'
  ) and exists (select 1 from public.candidates) then
    raise exception 'LEGACY_CANDIDATES_REQUIRE_CLEARANCE: clear old candidate data before applying this migration';
  end if;
end $$;

alter table public.candidates add column if not exists name_zh text;
alter table public.candidates add column if not exists name_vi text;
alter table public.candidates drop column if exists name;
alter table public.candidates alter column name_zh set not null;
alter table public.candidates alter column name_vi set not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conrelid = 'public.candidates'::regclass and conname = 'candidates_name_zh_check') then
    alter table public.candidates add constraint candidates_name_zh_check check (length(trim(name_zh)) > 0);
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.candidates'::regclass and conname = 'candidates_name_vi_check') then
    alter table public.candidates add constraint candidates_name_vi_check check (length(trim(name_vi)) > 0);
  end if;
end $$;

create or replace function public.start_election(p_candidates jsonb)
returns uuid language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_election_id uuid;
begin
  if jsonb_typeof(p_candidates) is distinct from 'array' then
    raise exception 'CANDIDATES_MUST_BE_ARRAY' using errcode = '22023';
  end if;
  if jsonb_array_length(p_candidates) < 1 then
    raise exception 'CANDIDATE_REQUIRED' using errcode = '22023';
  end if;
  if exists (
    select 1 from jsonb_array_elements(p_candidates) as candidate(value)
    where nullif(trim(candidate.value->>'name_zh'), '') is null
       or nullif(trim(candidate.value->>'name_vi'), '') is null
       or nullif(trim(candidate.value->>'image_url'), '') is null
  ) then
    raise exception 'CANDIDATE_NAME_AND_IMAGE_REQUIRED' using errcode = '22023';
  end if;
  if exists (select 1 from public.elections where status = 'opened') then
    raise exception 'ELECTION_ALREADY_OPEN' using errcode = '23505';
  end if;
  insert into public.elections(status) values ('opened') returning id into v_election_id;
  insert into public.candidates(election_id, name_zh, name_vi, image_url, display_order)
  select v_election_id, trim(c->>'name_zh'), trim(c->>'name_vi'), trim(c->>'image_url'), ordinality::integer
  from jsonb_array_elements(p_candidates) with ordinality as rows(c, ordinality);
  return v_election_id;
end;
$$;
revoke all on function public.start_election(jsonb) from public, anon, authenticated;
grant execute on function public.start_election(jsonb) to service_role;

commit;
