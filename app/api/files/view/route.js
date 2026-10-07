import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { getFile, readPrivate } from "@/lib/storage";

export const dynamic = "force-dynamic";

// فتح ملف من المخزن الخاص بعد التأكد من دخول لوحة التحكم
export async function GET(req) {
  if (!isAuthed()) return new NextResponse("غير مصرّح", { status: 401 });
  const sp = new URL(req.url).searchParams;
  const f = await getFile(String(sp.get("id") || "")).catch(() => null);
  if (!f) return new NextResponse("غير موجود", { status: 404 });
  try {
    const res = await readPrivate(f.url);
    if (!res || res.statusCode !== 200) return new NextResponse("غير موجود", { status: 404 });
    const name = encodeURIComponent(f.name || "file");
    return new NextResponse(res.stream, {
      headers: {
        "Content-Type": res.blob.contentType || f.type || "application/octet-stream",
        "Content-Disposition": `${sp.get("download") ? "attachment" : "inline"}; filename*=UTF-8''${name}`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    console.error("File view failed", e);
    return new NextResponse("تعذر فتح الملف", { status: 500 });
  }
}
