import { NextResponse } from "next/server";
import { handleUpload } from "@vercel/blob/client";
import { isAuthed } from "@/lib/auth";

// هل تخزين الصور (Vercel Blob) مربوط؟
export async function GET() {
  if (!isAuthed()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ blob: !!process.env.BLOB_READ_WRITE_TOKEN });
}

export async function POST(request) {
  const body = await request.json();
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        if (!isAuthed()) throw new Error("غير مصرّح");
        return {
          allowedContentTypes: ["image/*", "video/*"],
          maximumSizeInBytes: 200 * 1024 * 1024,
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
