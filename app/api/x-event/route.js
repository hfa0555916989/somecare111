import { NextResponse } from "next/server";
import { getContent } from "@/lib/content";
import { rateLimit, clientIp } from "@/lib/inquiries";
import { sendXConversion, xCapiEnabled } from "@/lib/x-capi";

export const dynamic = "force-dynamic";

// نقرة واتساب أو اتصال من الموقع: يرسلها المتصفح هنا لتُسجَّل عبر X Conversion API
export async function POST(req) {
  if (!xCapiEnabled()) return NextResponse.json({ ok: true, skipped: true });
  const b = await req.json().catch(() => ({}));
  const ip = clientIp(req);
  if (!(await rateLimit(`xev:${ip}`, 20, 3600))) return NextResponse.json({ ok: true, skipped: true });
  const c = await getContent();
  const r = await sendXConversion(c.tracking, {
    conversionId: String(b.id || "").replace(/[^A-Za-z0-9_-]/g, ""),
    twclid: String(b.twclid || "").replace(/[^A-Za-z0-9_-]/g, ""),
    ip: ip === "anon" ? "" : ip,
    ua: req.headers.get("user-agent") || "",
  });
  return NextResponse.json({ ok: true, sent: !!r.ok });
}
