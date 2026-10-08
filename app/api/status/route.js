import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { dbConnected, getContent } from "@/lib/content";
import { listDocs, TYPES } from "@/lib/docs";
import { listProjects, vaultKeySource, PROJECT_STATUS } from "@/lib/projects";
import { storageHealth } from "@/lib/storage";
import { turnstileEnabled } from "@/lib/turnstile";
import { mailEnabled } from "@/lib/mail";
import { voiceEnabled } from "@/lib/voice";
import { aiEnabled } from "@/lib/ai";

export const dynamic = "force-dynamic";

// حالة الخدمات المربوطة + التزاماتك (للدليل الإرشادي والإجرائي)
export async function GET() {
  if (!isAuthed()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const [c, docs, projects] = await Promise.all([getContent(), listDocs().catch(() => []), listProjects().catch(() => [])]);
  const s = await storageHealth();
  const services = {
    admin: !!process.env.ADMIN_PASSWORD,
    authSecret: !!process.env.AUTH_SECRET,
    db: dbConnected(),
    publicBlob: s.publicBlob === "ok",
    privateBlob: s.privateBlob === "ok",
    blobErrors: [s.publicBlob === "error" && "العام", s.privateBlob === "error" && "الخاص"].filter(Boolean),
    ai: aiEnabled(),
    mail: mailEnabled(),
    mailTo: !!c.form?.notifyEmail,
    voice: voiceEnabled(),
    turnstile: turnstileEnabled(),
    vaultKey: !!process.env.VAULT_KEY,
    vaultKeySource: vaultKeySource(),
  };

  const accepted = docs.filter((d) => d.status === "accepted");
  const commitments = {
    contracts: accepted.map((d) => ({
      number: d.number, type: TYPES[d.type], title: d.title, client: d.client?.company || d.client?.name || "",
      acceptedAt: String(d.acceptance?.at || "").slice(0, 10), duration: d.duration, recurring: d.recurring || [], archived: !!d.archive?.jsonFileId,
    })),
    renewals: projects
      .flatMap((p) => (p.renewals || []).map((r) => ({ ...r, project: p.name, client: p.client })))
      .filter((r) => r.date)
      .sort((a, b) => a.date.localeCompare(b.date)),
    projects: projects.map((p) => ({ name: p.name, client: p.client, status: PROJECT_STATUS[p.status], obligations: p.obligations })).filter((p) => p.obligations),
    quoteTerms: c.contracts?.quoteTerms || [],
    contractTerms: c.contracts?.contractTerms || [],
    pages: (c.pages || []).filter((p) => p.published !== false).map((p) => ({ title: p.title, slug: p.slug })),
  };
  return NextResponse.json({ services, commitments });
}
