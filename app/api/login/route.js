import { NextResponse } from "next/server";
import { checkPassword, sessionCookie, COOKIE } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/inquiries";

export async function POST(req) {
  const { password } = await req.json().catch(() => ({}));
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "لم يتم ضبط ADMIN_PASSWORD في Vercel" }, { status: 500 });
  }
  // 10 محاولات كحد أقصى كل 15 دقيقة لكل IP لمنع تخمين كلمة المرور
  if (!(await rateLimit(`login:${clientIp(req)}`, 10, 900))) {
    return NextResponse.json({ error: "محاولات كثيرة، حاول بعد 15 دقيقة" }, { status: 429 });
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
