import { NextResponse } from "next/server";
import { checkPassword, sessionCookie, COOKIE } from "@/lib/auth";

export async function POST(req) {
  const { password } = await req.json().catch(() => ({}));
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "لم يتم ضبط ADMIN_PASSWORD في Vercel" }, { status: 500 });
  }
  if (!checkPassword(password)) {
    return NextResponse.json({ error: "كلمة المرور غير صحيحة" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookie());
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ name: COOKIE, value: "", path: "/", maxAge: 0 });
  return res;
}
