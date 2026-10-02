import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { dbConnected } from "@/lib/content";
import { listInquiries, updateInquiry, deleteInquiry, resendConnected } from "@/lib/inquiries";

export const dynamic = "force-dynamic";

const deny = () => NextResponse.json({ error: "unauthorized" }, { status: 401 });

export async function GET() {
  if (!isAuthed()) return deny();
  return NextResponse.json({ items: await listInquiries(), db: dbConnected(), resend: resendConnected() });
}

export async function PATCH(req) {
  if (!isAuthed()) return deny();
  const { id, status, note } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "id" }, { status: 400 });
  const item = await updateInquiry(String(id), { status, note });
  return item ? NextResponse.json({ item }) : NextResponse.json({ error: "غير موجود" }, { status: 404 });
}

export async function DELETE(req) {
  if (!isAuthed()) return deny();
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id" }, { status: 400 });
  await deleteInquiry(id);
  return NextResponse.json({ ok: true });
}
