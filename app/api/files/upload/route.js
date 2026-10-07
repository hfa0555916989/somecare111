import { NextResponse } from "next/server";
import { handleUpload } from "@vercel/blob/client";
import { isAuthed } from "@/lib/auth";
import { privateToken } from "@/lib/storage";

// رفع مباشر من المتصفح إلى المخزن الخاص (العقود والفواتير والملفات)
export async function POST(request) {
  const body = await request.json();
  try {
    const json = await handleUpload({
      body,
      request,
      token: privateToken() || undefined,
      onBeforeGenerateToken: async (pathname) => {
        if (!isAuthed()) throw new Error("غير مصرّح");
        if (!privateToken()) throw new Error("المخزن الخاص غير مربوط");
        if (!pathname.startsWith("archive/")) throw new Error("مسار غير صالح");
        return {
          allowedContentTypes: ["image/*", "application/pdf", "text/plain", "text/csv", "application/zip", "application/json",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
          maximumSizeInBytes: 100 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(json);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
