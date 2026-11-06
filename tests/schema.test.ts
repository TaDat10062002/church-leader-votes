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
      await db.exec(schema);
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

      const election = await db.query<{ id: string }>(`
        select public.start_election('[{"name":"Reset candidate","image_url":"https://example.invalid/candidate.png"}]'::jsonb) as id
      `);
      const candidate = await db.query<{ id: string }>("select id from public.candidates");
      await db.query("select public.cast_vote($1, $2::uuid[])", [election.rows[0].id, [candidate.rows[0].id]]);

      await db.exec("select public.reset_election()");
      for (const table of ["elections", "candidates", "votes", "vote_selections"]) {
        const rows = await db.query<{ count: number }>(`select count(*)::int as count from public.${table}`);
        expect(rows.rows[0].count, `${table} should be empty after reset`).toBe(0);
      }

      const rollbackElection = await db.query<{ id: string }>(`
        select public.start_election('[{"name":"Rollback candidate","image_url":"https://example.invalid/candidate.png"}]'::jsonb) as id
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
});
