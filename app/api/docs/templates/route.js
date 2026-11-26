import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { templatesWithClients } from "@/lib/doc-templates";

export const dynamic = "force-dynamic";

// القوالب الجاهزة مع بيانات العميل من متغير البيئة DOC_TEMPLATE_CLIENTS (خاص، لا يُحفظ في المستودع)
export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ items: templatesWithClients(process.env.DOC_TEMPLATE_CLIENTS) });
}
