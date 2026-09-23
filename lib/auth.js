import crypto from "crypto";
import { cookies } from "next/headers";

export const COOKIE = "admin_token";

function token() {
  const secret = process.env.AUTH_SECRET || process.env.ADMIN_PASSWORD || "";
  return crypto.createHmac("sha256", secret).update("admin-session").digest("hex");
}

export function checkPassword(input) {
  const expected = process.env.ADMIN_PASSWORD || "";
  const a = Buffer.from(String(input || ""));
  const b = Buffer.from(expected);
  return b.length > 0 && a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function isAuthed() {
  if (!process.env.ADMIN_PASSWORD) return false;
  const v = cookies().get(COOKIE)?.value;
  if (!v) return false;
  const a = Buffer.from(v);
  const b = Buffer.from(token());
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function sessionCookie() {
  return {
    name: COOKIE,
    value: token(),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}
