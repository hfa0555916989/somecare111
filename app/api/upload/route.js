import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { presignedUploadRoute, publicEnabled } from "@/lib/storage";

// هل تخزين الصور (Vercel Blob) مربوط؟
export async function GET() {
  if (!isAuthed()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ blob: publicEnabled() });
}

// رفع صور وفيديو الموقع من المتصفح إلى المخزن العام (روابط موقّعة، تعمل مع المخازن الحديثة والقديمة)
export async function POST(request) {
  try {
    const json = await presignedUploadRoute(request, {
      access: "public",
      allowed: ["image/*", "video/*", "application/pdf"],
      maxBytes: 200 * 1024 * 1024,
      authorize: async () => {
        if (!isAuthed()) throw new Error("غير مصرّح");
      },
    });
    return NextResponse.json(json);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
