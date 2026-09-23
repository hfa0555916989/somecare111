import { NextResponse } from "next/server";
import { handleUpload } from "@vercel/blob/client";
import { isAuthed } from "@/lib/auth";

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
