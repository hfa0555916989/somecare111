import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { dbConnected } from "@/lib/content";
import { listDocs } from "@/lib/docs";
import { listProjects, saveProject, deleteProject, vaultKeySource, PROJECT_STATUS } from "@/lib/projects";

export const dynamic = "force-dynamic";

const deny = () => NextResponse.json({ error: "unauthorized" }, { status: 401 });
const fail = (e) =>
  NextResponse.json(
    {
      error:
        e.message === "DB_NOT_CONNECTED"
          ? "قاعدة البيانات غير مربوطة."
          : e.message === "NO_KEY"
            ? "أضف VAULT_KEY في Vercel لتشفير المفاتيح قبل حفظها."
            : "تعذر الحفظ",
    },
    { status: 500 }
  );
const noStore = { headers: { "Cache-Control": "private, no-store" } };

export async function GET() {
  if (!isAuthed()) return deny();
  const [items, docs] = await Promise.all([listProjects(), listDocs()]);
  const contracts = docs.filter((d) => d.status === "accepted").map((d) => ({ number: d.number, title: d.title, client: d.client?.company || d.client?.name || "", date: d.date }));
  return NextResponse.json({ items, contracts, statuses: PROJECT_STATUS, db: dbConnected(), keySource: vaultKeySource() }, noStore);
}

export async function POST(req) {
  if (!isAuthed()) return deny();
  try {
    return NextResponse.json({ item: await saveProject(null, await req.json().catch(() => ({}))) }, noStore);
  } catch (e) {
    return fail(e);
  }
}

export async function PUT(req) {
  if (!isAuthed()) return deny();
  const b = await req.json().catch(() => ({}));
  if (!b.id) return NextResponse.json({ error: "id" }, { status: 400 });
  try {
    const item = await saveProject(String(b.id), b);
    return item ? NextResponse.json({ item }, noStore) : NextResponse.json({ error: "غير موجود" }, { status: 404 });
  } catch (e) {
    return fail(e);
  }
}

export async function DELETE(req) {
  if (!isAuthed()) return deny();
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id" }, { status: 400 });
  try {
    await deleteProject(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
