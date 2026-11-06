import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { timingSafeEqual } from "node:crypto";

const COOKIE = "church_admin";
const MAX_AGE = 60 * 60 * 8;
const attempts = new Map<string, { count: number; until: number }>();

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("ADMIN_SESSION_SECRET cần tối thiểu 32 ký tự.");
  return new TextEncoder().encode(value);
}

function safeEqual(actual: string, expected: string) {
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function checkPasscode(passcode: string, ip: string) {
  const now = Date.now();
  const current = attempts.get(ip);
  if (current && current.until > now && current.count >= 8) return false;
  if (current && current.until <= now) attempts.delete(ip);
  const valid = process.env.ADMIN_ROLE === "ADMIN" && Boolean(process.env.ADMIN_PASSCODE) && safeEqual(passcode, process.env.ADMIN_PASSCODE!);
  if (valid) attempts.delete(ip);
  else {
    const entry = attempts.get(ip);
    attempts.set(ip, { count: (entry?.count ?? 0) + 1, until: entry?.until && entry.until > now ? entry.until : now + 15 * 60 * 1000 });
  }
  return valid;
}

export async function createAdminToken() {
  return new SignJWT({ role: "ADMIN" }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(`${MAX_AGE}s`).sign(secret());
}

export async function isAdminToken(token?: string) {
  if (!token || process.env.ADMIN_ROLE !== "ADMIN") return false;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.role === "ADMIN";
  } catch { return false; }
}

export async function hasAdminSession() {
  const store = await cookies();
  return isAdminToken(store.get(COOKIE)?.value);
}

export const adminCookieName = COOKIE;
export const adminCookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: MAX_AGE };
