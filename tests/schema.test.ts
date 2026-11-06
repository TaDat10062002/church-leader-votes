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
      await db.exec(schema);
      await db.exec(smoke);
      const result = await db.query<{ count: number }>("select count(*)::int as count from public.votes");
      expect(result.rows[0].count).toBe(0);
    } finally {
      await db.close();
    }
  });
});
