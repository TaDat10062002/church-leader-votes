import { readFile } from "node:fs/promises";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { describe, expect, it } from "vitest";

describe("Supabase PostgreSQL schema", () => {
  it("creates the schema and passes the SQL ballot smoke test on a fresh database", async () => {
    const db = new PGlite({ extensions: { pgcrypto } });
    try {
      await db.exec(`
        create role anon;
        create role authenticated;
        create role service_role;
        create schema storage;
        create table storage.buckets (
          id text primary key, name text not null, public boolean not null,
          file_size_limit bigint, allowed_mime_types text[]
        );
      `);
      const schema = await readFile(path.join(process.cwd(), "supabase/sql/001_schema.sql"), "utf8");
      const smoke = await readFile(path.join(process.cwd(), "supabase/sql/002_smoke_test.sql"), "utf8");
      const reset = await readFile(path.join(process.cwd(), "supabase/sql/003_reset_election.sql"), "utf8");
      const statusMigration = await readFile(path.join(process.cwd(), "supabase/sql/004_election_status_enum.sql"), "utf8");
      const realtimeAccess = await readFile(path.join(process.cwd(), "supabase/sql/005_election_realtime_access.sql"), "utf8");
      const bilingualMigration = await readFile(path.join(process.cwd(), "supabase/sql/007_candidate_bilingual_names.sql"), "utf8");
      await db.exec(schema);
      await db.exec(statusMigration);
      await db.exec(realtimeAccess);
      await db.exec(bilingualMigration);
      await db.exec(smoke);
      await db.exec(reset);
      const grants = await db.query<{ anon: boolean; authenticated: boolean; service_role: boolean }>(`
        select
          has_function_privilege('anon', 'public.reset_election()', 'EXECUTE') as anon,
          has_function_privilege('authenticated', 'public.reset_election()', 'EXECUTE') as authenticated,
          has_function_privilege('service_role', 'public.reset_election()', 'EXECUTE') as service_role
      `);
      expect(grants.rows[0]).toEqual({ anon: false, authenticated: false, service_role: true });
      const result = await db.query<{ count: number }>("select count(*)::int as count from public.votes");
      expect(result.rows[0].count).toBe(0);
      const statusType = await db.query<{ labels: string[] }>(`
        select array_agg(enumlabel order by enumsortorder) as labels
        from pg_enum join pg_type on pg_type.oid = enumtypid
        where pg_type.typname = 'election_status'
      `);
      expect(statusType.rows[0].labels).toEqual(["opened", "closed"]);
      const access = await db.query<{ elections: boolean; candidates: boolean; votes: boolean; selections: boolean }>(`
        select
          has_table_privilege('anon', 'public.elections', 'SELECT') as elections,
          has_table_privilege('anon', 'public.candidates', 'SELECT') as candidates,
          has_table_privilege('anon', 'public.votes', 'SELECT') as votes,
          has_table_privilege('anon', 'public.vote_selections', 'SELECT') as selections
      `);
      expect(access.rows[0]).toEqual({ elections: true, candidates: false, votes: false, selections: false });
      const readPolicy = await db.query<{ count: number }>(`
        select count(*)::int as count from pg_policies
        where schemaname = 'public' and tablename = 'elections' and policyname = 'elections_realtime_read'
      `);
      expect(readPolicy.rows[0].count).toBe(1);

      const election = await db.query<{ id: string }>(`
        select public.start_election('[{"name_zh":"王一","name_vi":"Reset candidate","image_url":"https://example.invalid/candidate.png"}]'::jsonb) as id
      `);
      const names = await db.query<{ name_zh: string; name_vi: string }>("select name_zh, name_vi from public.candidates");
      expect(names.rows[0]).toEqual({ name_zh: "王一", name_vi: "Reset candidate" });
      const candidate = await db.query<{ id: string }>("select id from public.candidates");
      await db.query("select public.cast_vote($1, $2::uuid[])", [election.rows[0].id, [candidate.rows[0].id]]);

      await db.query("update public.elections set status = 'closed' where id = $1", [election.rows[0].id]);
      await expect(db.query("select public.cast_vote($1, $2::uuid[])", [election.rows[0].id, [candidate.rows[0].id]])).rejects.toThrow("ELECTION_NOT_OPEN");
      for (const [table, expected] of [["votes", 1], ["vote_selections", 1]] as const) {
        const rows = await db.query<{ count: number }>(`select count(*)::int as count from public.${table}`);
        expect(rows.rows[0].count, `${table} should not change after a closed-election rejection`).toBe(expected);
      }

      await db.exec("select public.reset_election()");
      for (const table of ["elections", "candidates", "votes", "vote_selections"]) {
        const rows = await db.query<{ count: number }>(`select count(*)::int as count from public.${table}`);
        expect(rows.rows[0].count, `${table} should be empty after reset`).toBe(0);
      }

      const rollbackElection = await db.query<{ id: string }>(`
        select public.start_election('[{"name_zh":"王二","name_vi":"Rollback candidate","image_url":"https://example.invalid/candidate.png"}]'::jsonb) as id
      `);
      const rollbackCandidate = await db.query<{ id: string }>("select id from public.candidates");
      await db.query("select public.cast_vote($1, $2::uuid[])", [rollbackElection.rows[0].id, [rollbackCandidate.rows[0].id]]);
      await db.exec(`
        create function public.reject_candidate_delete() returns trigger language plpgsql as $$
        begin raise exception 'forced reset failure'; end;
        $$;
        create trigger reject_candidate_delete before delete on public.candidates
        for each row execute function public.reject_candidate_delete();
      `);

      await expect(db.exec("select public.reset_election()")).rejects.toThrow("forced reset failure");
      for (const [table, expected] of [["elections", 1], ["candidates", 1], ["votes", 1], ["vote_selections", 1]] as const) {
        const rows = await db.query<{ count: number }>(`select count(*)::int as count from public.${table}`);
        expect(rows.rows[0].count, `${table} should be restored after a failed reset`).toBe(expected);
      }

      await db.exec("drop trigger reject_candidate_delete on public.candidates; drop function public.reject_candidate_delete(); select public.reset_election()");
    } finally {
      await db.close();
    }
  });

  it("blocks migration while legacy candidates exist and installs bilingual names after they are cleared", async () => {
    const db = new PGlite({ extensions: { pgcrypto } });
    try {
      await db.exec(`
        create extension if not exists pgcrypto;
        create role anon; create role authenticated; create role service_role;
        create table public.elections (id uuid primary key default gen_random_uuid(), status text not null);
        create table public.candidates (id uuid primary key default gen_random_uuid(), election_id uuid, name text not null, image_url text not null, display_order integer);
        insert into public.candidates(name, image_url) values ('Legacy name', 'https://example.org/a.png');
      `);
      const migration = await readFile(path.join(process.cwd(), "supabase/sql/007_candidate_bilingual_names.sql"), "utf8");
      await expect(db.exec(migration)).rejects.toThrow("LEGACY_CANDIDATES_REQUIRE_CLEARANCE");
      await db.exec("rollback");
      const legacy = await db.query<{ name: string }>("select name from public.candidates");
      expect(legacy.rows).toEqual([{ name: "Legacy name" }]);
      await db.exec("delete from public.candidates");
      await db.exec(migration);
      await db.exec(migration);
      await db.query("select public.start_election($1::jsonb)", [JSON.stringify([{ name_zh: "王小明", name_vi: "Nguyễn An", image_url: "https://example.org/a.png" }])]);
      const saved = await db.query<{ name_zh: string; name_vi: string }>("select name_zh, name_vi from public.candidates");
      expect(saved.rows).toEqual([{ name_zh: "王小明", name_vi: "Nguyễn An" }]);
    } finally {
      await db.close();
    }
  });

  it("migrates legacy open and closed election statuses to the enum", async () => {
    const db = new PGlite();
    try {
      await db.exec(`
        create table public.elections (
          id integer primary key,
          status text not null default 'open' check (status in ('open', 'closed')),
          created_at timestamptz not null default now(),
          started_at timestamptz not null default now(),
          closed_at timestamptz
        );
        insert into public.elections(id, status) values (1, 'open'), (2, 'closed');
        create unique index elections_one_open_idx on public.elections ((status)) where status = 'open';
      `);
      const migration = await readFile(path.join(process.cwd(), "supabase/sql/004_election_status_enum.sql"), "utf8");
      await db.exec(migration);

      const rows = await db.query<{ status: string }>("select status::text from public.elections order by id");
      expect(rows.rows.map((row) => row.status)).toEqual(["opened", "closed"]);
      const defaultStatus = await db.query<{ status: string }>("select column_default as status from information_schema.columns where table_schema = 'public' and table_name = 'elections' and column_name = 'status'");
      expect(defaultStatus.rows[0].status).toContain("opened");
      await db.exec("update public.elections set status = 'closed' where id = 1");
      await expect(db.exec("insert into public.elections(id) values (3)")).resolves.toBeDefined();
      await expect(db.exec("insert into public.elections(id) values (4)")).rejects.toThrow();
    } finally {
      await db.close();
    }
  });
});
