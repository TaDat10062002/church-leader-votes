"use server";

import { cookies, headers } from "next/headers";
import { GET as activeElection } from "@/app/api/elections/active/route";
import { GET as results } from "@/app/api/admin/results/route";
import { POST as login, DELETE as logout } from "@/app/api/admin/session/route";
import { POST as vote } from "@/app/api/votes/route";
import { POST as parseExcel } from "@/app/api/admin/parse-excel/route";
import { POST as start } from "@/app/api/admin/start/route";
import { POST as reset } from "@/app/api/admin/reset/route";
import { adminCookieName } from "@/lib/admin-auth";
import type { CandidateDraft, ElectionData, ResultRow } from "@/lib/types";

type Result<T> = { ok: true; data: T } | { ok: false; status: number; code: string; values?: Record<string, string | number> };
type Results = { election: { id: string } | null; results: ResultRow[] };

async function result<T>(response: Response): Promise<Result<T>> {
  const body = await response.json();
  return response.ok ? { ok: true, data: body as T } : {
    ok: false, status: response.status, code: body.code ?? "REQUEST_INVALID", values: body.values,
  };
}

async function request(path: string, body?: unknown, form?: FormData) {
  const store = await cookies();
  const token = store.get(adminCookieName)?.value;
  const requestHeaders = new Headers();
  if (token) requestHeaders.set("cookie", `${adminCookieName}=${token}`);
  if (body !== undefined) requestHeaders.set("content-type", "application/json");
  return new Request(`http://localhost${path}`, {
    method: body !== undefined || form ? "POST" : "GET",
    headers: requestHeaders,
    body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
  });
}

export async function getActiveElection() {
  return result<{ election: ElectionData | null }>(await activeElection());
}

export async function getResults() {
  return result<Results>(await results(await request("/api/admin/results")));
}

export async function submitBallot(electionId: string, candidateIds: string[]) {
  return result<{ ok: true }>(await vote(await request("/api/votes", { electionId, candidateIds })));
}

export async function loginAdmin(passcode: string) {
  const incoming = await headers();
  const response = await login(new Request("http://localhost/api/admin/session", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": incoming.get("x-forwarded-for") ?? "unknown" },
    body: JSON.stringify({ passcode }),
  }));
  const session = response.cookies.get(adminCookieName);
  if (session) (await cookies()).set(session);
  return result<{ ok: true }>(response);
}

export async function logoutAdmin() {
  const response = await logout();
  const session = response.cookies.get(adminCookieName);
  if (session) (await cookies()).set(session);
  return result<{ ok: true }>(response);
}

export async function parseRosterFile(form: FormData) {
  return result<{ candidates: CandidateDraft[] }>(await parseExcel(await request("/api/admin/parse-excel", undefined, form)));
}

export async function startElection(candidates: CandidateDraft[]) {
  return result<{ ok: true }>(await start(await request("/api/admin/start", { candidates })));
}

export async function resetElection() {
  return result<{ ok: true }>(await reset(await request("/api/admin/reset", {})));
}
