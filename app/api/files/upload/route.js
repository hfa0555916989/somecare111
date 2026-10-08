import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { presignedUploadRoute, privateEnabled } from "@/lib/storage";

const ALLOWED = [
  "image/*", "application/pdf", "text/plain", "text/csv", "application/zip", "application/json",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

// رفع مباشر من المتصفح إلى المخزن الخاص (العقود والفواتير والملفات)
export async function POST(request) {
  try {
    const json = await presignedUploadRoute(request, {
      access: "private",
      allowed: ALLOWED,
      maxBytes: 100 * 1024 * 1024,
      prefix: "archive/",
      authorize: async () => {
        if (!isAuthed()) throw new Error("غير مصرّح");
        if (!privateEnabled()) throw new Error("المخزن الخاص غير مربوط");
      },
    });
    return NextResponse.json(json);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
