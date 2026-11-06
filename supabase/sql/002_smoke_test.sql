-- Optional smoke test for a fresh schema. All fixture rows are rolled back.
begin;
do $$
declare
  v_election uuid;
  v_ids uuid[];
  v_vote uuid;
  v_votes_before integer;
  v_selections_before integer;
begin
  begin
    perform public.start_election('[]'::jsonb);
    raise exception 'Empty roster unexpectedly started an election';
  exception when sqlstate '22023' then null; end;

  if exists (select 1 from public.elections where status = 'opened') then raise exception 'Empty roster created an active election'; end if;

  select public.start_election(jsonb_agg(jsonb_build_object(
    'name', 'Smoke candidate ' || n,
    'image_url', 'https://example.invalid/' || n || '.png'
  ) order by n)) into v_election
  from generate_series(1, 10) n;

  if not exists (select 1 from public.elections where id = v_election and status = 'opened') then raise exception 'Non-empty roster did not create an active election'; end if;
  if (select count(*) from public.candidates where election_id = v_election) <> 10 then raise exception 'Official candidate roster was not created'; end if;

  select array_agg(id order by display_order) into v_ids from public.candidates where election_id = v_election;

  v_vote := public.cast_vote(v_election, v_ids[1:3]);
  if (select count(*) from public.votes where id = v_vote) <> 1 then raise exception 'Valid ballot was not recorded'; end if;
  if (select count(*) from public.vote_selections where vote_id = v_vote) <> 3 then raise exception 'Valid selections were not recorded'; end if;

  select count(*) into v_votes_before from public.votes;
  select count(*) into v_selections_before from public.vote_selections;

  begin perform public.cast_vote(v_election, '{}'::uuid[]); raise exception 'Empty ballot unexpectedly passed';
  exception when sqlstate '22023' then null; end;
  begin perform public.cast_vote(v_election, array[v_ids[1], v_ids[1]]); raise exception 'Duplicate candidate unexpectedly passed';
  exception when sqlstate '22023' then null; end;
  begin perform public.cast_vote(v_election, v_ids); raise exception 'Ten selections unexpectedly passed';
  exception when sqlstate '22023' then null; end;
  begin perform public.cast_vote(v_election, array[gen_random_uuid()]); raise exception 'Unknown candidate unexpectedly passed';
  exception when sqlstate '22023' then null; end;

  if (select count(*) from public.votes) <> v_votes_before then raise exception 'Invalid ballot left a vote row'; end if;
  if (select count(*) from public.vote_selections) <> v_selections_before then raise exception 'Invalid ballot left selection rows'; end if;

  begin
    insert into public.vote_selections(vote_id, candidate_id, slot_number) values (v_vote, v_ids[1], 4);
    raise exception 'Duplicate candidate constraint unexpectedly passed';
  exception when unique_violation then null; end;
  begin
    insert into public.vote_selections(vote_id, candidate_id, slot_number) values (v_vote, v_ids[4], 1);
    raise exception 'Duplicate slot constraint unexpectedly passed';
  exception when unique_violation then null; end;
end;
$$;
rollback;
