import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { listStores, getStore, saveStore, patchStore, deleteStore, publicStore, storeSecret, logAction, listLog, slugOk, domainOk, getRollout, saveRollout } from "@/lib/stores/db";
import { cpCall } from "@/lib/stores/signing";
import { STEPS, runStep } from "@/lib/stores/provision";
import { syncStore, mergeSyncPr, revertSyncCommit } from "@/lib/stores/sync";
import { readFile, templateRepo, ghToken, gh, headSha } from "@/lib/stores/github";
import { cloudToken, lc } from "@/lib/stores/cloud";
import { applyDeployKick, applyProbe, applyRedeploy, applyRevert, applySyncResult, beginPromote, cancelRollout, confirmCanaryPush, emptyRollout, failStore, finishIfDrained, markCanary, nextAction, noteTimeout, publicRollout, publishIntent, rolloutBusy } from "@/lib/stores/rollout";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// لوحة متاجر العملاء: خاصة بالمطوّر فقط (جلسة لوحة التحكم). الأسرار لا تخرج من الخادم
const deny = () => NextResponse.json({ error: "unauthorized" }, { status: 401 });
const bad = (error, status = 400) => NextResponse.json({ error }, { status });
const forcedDry = () => process.env.STORES_DRY_RUN === "1";
const UPDATE_ACTIONS = ["migrate", "optimize", "clear-cache", "queue-restart", "redeploy"];
const msg = (e) => (e.message === "DB_NOT_CONNECTED" ? "قاعدة البيانات غير مربوطة." : e.message === "NO_KEY" ? "أضف VAULT_KEY في Vercel لتشفير الأسرار." : e.message || "خطأ");

async function templateVersion() {
  try {
    return (await readFile(templateRepo(), "VERSION", "main")).text.trim();
  } catch {
    return "";
  }
}

async function cp(store, endpoint, method = "GET", payload) {
  return cpCall({ baseUrl: store.baseUrl, secret: storeSecret(store).cpSecret, endpoint, method, payload });
}

const nowIso = () => new Date().toISOString();
const BANNED_ACTIONS = new Set(["restore", "backup", "backups", "backups/restore"]);

function guardRollout(action) {
  if (!action || BANNED_ACTIONS.has(action.type) || (action.actions || []).some((a) => BANNED_ACTIONS.has(a)) || action.restoreDatabase) {
    throw new Error("مسار النشر لا يسترجع قاعدة البيانات");
  }
}

async function rememberSync(s, r) {
  if (r.status === "pushed") await patchStore(s.id, { templateSha: r.nextSha, syncPr: null, pendingTemplateSha: null, syncPrUrl: null });
  else if (r.status === "pr") await patchStore(s.id, { syncPr: r.pr, syncPrUrl: r.prUrl, pendingTemplateSha: r.nextSha });
  else if (r.status === "uptodate" || r.status === "nothing") await patchStore(s.id, { templateSha: r.nextSha });
}

async function stepRollout(rollout) {
  const now = nowIso();
  const action = nextAction(rollout);
  guardRollout(action);
  if (action.type === "none") return rollout;
  if (action.type === "finish") return finishIfDrained(rollout, now);
  const s = await getStore(action.storeId);
  if (!s && action.type !== "redeploy") return failStore(rollout, action.storeId, "المتجر غير موجود", now);
  if (action.type === "sync") {
    if (forcedDry() || rollout.dry || s.dryRun) return failStore(rollout, s.id, "المتجر في وضع التجربة، لن يُدفع تحديث حقيقي.", now);
    try {
      const r = await syncStore({ store: s, templateRepo: templateRepo(), mode: "direct", dryRun: false });
      const next = applySyncResult(rollout, s, r, now);
      await rememberSync(s, r);
      await logAction({ store: s.name, storeId: s.id, action: `تعميم: مزامنة ${r.status}`, detail: r.commit || r.prUrl || "" });
      return next;
    } catch (e) {
      await logAction({ store: s.name, storeId: s.id, ok: false, action: "فشل تعميم التحديث", detail: e.message });
      return failStore(rollout, s.id, e.message, now);
    }
  }
  if (action.type === "kick") {
    let result = { skipped: true };
    try {
      if (s.cloud?.envId && cloudToken() && !forcedDry() && !rollout.dry && !s.dryRun) {
        await lc(`/environments/${s.cloud.envId}/deployments`, { method: "POST" });
        result = { ok: true };
      }
    } catch (e) {
      result = { ok: false, error: e.message };
    }
    return applyDeployKick(rollout, s.id, result, now);
  }
  if (action.type === "probe") {
    let health = "", version = "", error = "";
    try {
      const [v, h] = await Promise.all([cp(s, "version"), cp(s, "health")]);
      version = String(v?.templateVersion || "").trim();
      health = String(h?.status || "").trim();
    } catch (e) {
      error = e.message;
      health = "down";
    }
    const next = applyProbe(rollout, s.id, { health, version, error }, now, Date.now());
    const st = next.stores[s.id];
    if (st?.status === "healthy") await patchStore(s.id, { status: { ...(s.status || {}), at: now, version, health, error: "" } });
    if (st?.status === "healthy" || st?.status === "reverting") await logAction({ store: s.name, storeId: s.id, ok: st.status === "healthy", action: st.status === "healthy" ? "النشر سليم والنسخة مطابقة" : "انتهت مهلة النشر", detail: next.log?.[0]?.msg || "" });
    return next;
  }
  if (action.type === "revert") {
    const plan = action.actions || [];
    if (!plan.includes("revert_commit")) return applyRevert(rollout, action.storeId, { ok: false, error: "لا يوجد التزام مدفوع للتراجع" }, now);
    if (forcedDry() || rollout.dry) return applyRevert(rollout, action.storeId, { ok: false, error: "وضع التجربة لا يتراجع على مستودع حقيقي" }, now);
    try {
      const rev = await revertSyncCommit({ repo: s.repo, parent: action.parent, pushedSha: action.pushedSha });
      const next = applyRevert(rollout, s.id, { ok: true, revertSha: rev.revert }, now);
      const prev = next.stores[s.id]?.prevTemplateSha;
      if (prev) await patchStore(s.id, { templateSha: prev, syncPr: null, pendingTemplateSha: null, syncPrUrl: null });
      await logAction({ store: s.name, storeId: s.id, action: "تراجع عن مزامنة القالب دون استرجاع قاعدة البيانات", detail: rev.revert });
      return next;
    } catch (e) {
      await logAction({ store: s.name, storeId: s.id, ok: false, action: "فشل التراجع عن التزام التحديث", detail: e.message });
      return applyRevert(rollout, s.id, { ok: false, error: e.message }, now);
    }
  }
  if (action.type === "redeploy") {
    let result = { skipped: true };
    try {
      if (s?.cloud?.envId && cloudToken() && !forcedDry() && !rollout.dry) {
        await lc(`/environments/${s.cloud.envId}/deployments`, { method: "POST" });
        result = { ok: true };
      }
    } catch (e) {
      result = { ok: false, error: e.message };
    }
    const next = applyRedeploy(rollout, action.storeId, result, now);
    await logAction({ store: s?.name, storeId: action.storeId, ok: !!(result.ok || result.skipped), action: "إعادة النشر بعد التراجع", detail: "لم تُسترجع قاعدة البيانات" });
    return next;
  }
  return rollout;
}

async function rolloutTick() {
  let rollout = (await getRollout()) || emptyRollout();
  if (rollout.ticking && Date.now() - Date.parse(rollout.tickStartedAt || 0) < 50000) return rollout;
  rollout = { ...noteTimeout(rollout, Date.now()), ticking: true, tickStartedAt: nowIso() };
  await saveRollout(rollout);
  try {
    rollout = await stepRollout(rollout);
  } catch (e) {
    const id = rollout.activeId;
    rollout = id ? failStore(rollout, id, e.message, nowIso()) : { ...rollout, error: e.message };
  } finally {
    rollout = { ...rollout, ticking: false };
    await saveRollout(rollout);
  }
  return rollout;
}

async function refresh(store) {
  if (!store.baseUrl || !store.secret) return patchStore(store.id, { status: { at: new Date().toISOString(), error: "لم يُضبط رابط المتجر أو مفتاحه بعد" } });
  const status = { at: new Date().toISOString() };
  try {
    const [v, h] = await Promise.all([cp(store, "version"), cp(store, "health")]);
    Object.assign(status, { version: v.templateVersion, commit: v.commit, laravel: v.laravel, health: h.status, checks: h.checks, lastBackupAt: h.lastBackupAt || h.checks?.backups?.lastBackupAt || null });
  } catch (e) {
    status.error = e.message;
    status.health = "down";
  }
  // تحقق إن طلب تحديث القالب دُمج
  let extra = {};
  if (store.syncPr && ghToken()) {
    try {
      const pr = await gh(`/repos/${store.repo}/pulls/${store.syncPr}`);
      if (pr.merged) extra = { templateSha: store.pendingTemplateSha, syncPr: null, pendingTemplateSha: null, syncPrUrl: null };
      else if (pr.state === "closed") extra = { syncPr: null, pendingTemplateSha: null, syncPrUrl: null };
    } catch {}
  }
  return patchStore(store.id, { status, ...extra });
}

export async function GET(req) {
  if (!isAuthed()) return deny();
  const what = new URL(req.url).searchParams.get("what");
  try {
    if (what === "log") return NextResponse.json({ log: await listLog() });
    const [stores, latest] = await Promise.all([listStores(), templateVersion()]);
    return NextResponse.json({
      stores: stores.map(publicStore),
      steps: STEPS,
      template: { repo: templateRepo(), version: latest },
      rollout: publicRollout(await getRollout()),
      config: { github: !!ghToken(), cloud: !!cloudToken(), vault: !!(process.env.VAULT_KEY || process.env.AUTH_SECRET), forcedDry: forcedDry() },
    });
  } catch (e) {
    return bad(msg(e), 500);
  }
}

export async function POST(req) {
  if (!isAuthed()) return deny();
  const b = await req.json().catch(() => ({}));
  const dryRun = forcedDry() || !!b.dryRun;
  const one = async () => {
    const s = await getStore(b.id);
    if (!s) throw Object.assign(new Error("المتجر غير موجود"), { status: 404 });
    return s;
  };
  try {
    switch (b.action) {
      case "save": {
        const d = b.store || {};
        if (d.slug && !slugOk(String(d.slug).toLowerCase())) return bad("المعرّف (slug) حروف إنجليزية صغيرة وأرقام وشرطة، من 3 إلى 32");
        if (!domainOk(d.domain)) return bad("الدومين غير صالح");
        const secrets = d.cpSecret ? { cpSecret: String(d.cpSecret).trim() } : undefined;
        if (secrets && secrets.cpSecret.length < 32) return bad("مفتاح لوحة المطوّر 32 حرفاً على الأقل");
        const extra = {};
        if (/^[0-9a-f]{40}$/.test(d.templateSha || "")) extra.templateSha = d.templateSha;
        if (b.id == null && b.wizard) Object.assign(extra, { prov: { dryRun, steps: {} }, dryRun });
        const s = await saveStore(b.id || null, d, { secrets, extra });
        if (!s) return bad("المتجر غير موجود", 404);
        await logAction({ store: s.name, storeId: s.id, action: b.id ? "تعديل بيانات متجر" : b.wizard ? `بدء إنشاء متجر${dryRun ? " (تجربة)" : ""}` : "إضافة متجر موجود" });
        return NextResponse.json({ store: publicStore(s) });
      }
      case "adminCredentials": {
        // بيانات دخول مالك المتجر لتسليمها للعميل (للمطوّر فقط، تُسجَّل في السجل)
        const s = await one();
        const sec = storeSecret(s);
        await logAction({ store: s.name, storeId: s.id, action: "عرض بيانات دخول المالك" });
        return NextResponse.json({ url: s.baseUrl ? s.baseUrl + "/admin" : "", email: s.adminEmail || "", password: sec.adminPassword || "" });
      }
      case "delete": {
        const s = await one();
        await deleteStore(s.id);
        await logAction({ store: s.name, action: "حذف المتجر من اللوحة (المستودع والاستضافة لم يُحذفا)" });
        return NextResponse.json({ ok: true });
      }
      case "refresh": {
        const list = b.id ? [await one()] : await listStores();
        const out = await Promise.all(list.map(refresh));
        return NextResponse.json({ stores: out.map(publicStore) });
      }
      case "step": {
        let s = await one();
        const step = STEPS.find(([k]) => k === b.step)?.[0];
        if (!step) return bad("خطوة غير معروفة");
        const dry = forcedDry() || !!s.prov?.dryRun;
        const steps = { ...(s.prov?.steps || {}) };
        try {
          const r = await runStep(step, s, { templateRepo: templateRepo(), dryRun: dry, secrets: storeSecret(s) });
          steps[step] = { ok: true, detail: r.detail, at: new Date().toISOString() };
          if (r.secrets) s = await saveStore(s.id, {}, { secrets: r.secrets });
          const { cloud, dns, ...fields } = r.store || {};
          s = await patchStore(s.id, { ...fields, ...(cloud ? { cloud } : {}), ...(dns ? { dns } : {}), prov: { ...s.prov, steps } });
          await logAction({ store: s.name, storeId: s.id, action: `إنشاء: ${STEPS.find(([k]) => k === step)[1]}${dry ? " (تجربة)" : ""}`, detail: r.detail });
          return NextResponse.json({ store: publicStore(s), result: steps[step] });
        } catch (e) {
          steps[step] = { ok: false, detail: e.message, at: new Date().toISOString() };
          s = await patchStore(s.id, { prov: { ...s.prov, steps } });
          await logAction({ store: s.name, storeId: s.id, ok: false, action: `فشل: ${STEPS.find(([k]) => k === step)[1]}`, detail: e.message });
          return NextResponse.json({ store: publicStore(s), result: steps[step], error: e.message }, { status: 502 });
        }
      }
      case "sync": {
        const ids = Array.isArray(b.ids) ? b.ids.slice(0, 50) : [];
        const mode = b.mode === "direct" ? "direct" : "pr";
        const results = [];
        for (const id of ids) {
          const s = await getStore(id);
          if (!s) continue;
          try {
            const r = await syncStore({ store: s, templateRepo: templateRepo(), mode, dryRun: dryRun || !!s.dryRun });
            if (r.status === "pushed") await patchStore(s.id, { templateSha: r.nextSha, syncPr: null });
            if (r.status === "pr") await patchStore(s.id, { syncPr: r.pr, syncPrUrl: r.prUrl, pendingTemplateSha: r.nextSha });
            if (r.status === "uptodate" || r.status === "nothing") await patchStore(s.id, { templateSha: r.nextSha });
            results.push({ id, name: s.name, ok: true, ...r });
            await logAction({ store: s.name, storeId: s.id, action: `تحديث من القالب: ${r.status}${dryRun ? " (تجربة)" : ""}`, detail: `${r.apply ?? 0} ملف، ${r.remove ?? 0} حذف${r.conflicts?.length ? `، تعارض: ${r.conflicts.join(", ")}` : ""}${r.prUrl ? " " + r.prUrl : ""}` });
          } catch (e) {
            results.push({ id, name: s.name, ok: false, error: e.message });
            await logAction({ store: s.name, storeId: s.id, ok: false, action: "فشل تحديث من القالب", detail: e.message });
          }
        }
        return NextResponse.json({ results });
      }
      case "mergePr": {
        const s = await one();
        if (dryRun) return NextResponse.json({ ok: true, dry: true });
        await mergeSyncPr(s);
        await patchStore(s.id, { templateSha: s.pendingTemplateSha, syncPr: null, pendingTemplateSha: null, syncPrUrl: null });
        await logAction({ store: s.name, storeId: s.id, action: `دمج تحديث القالب #${s.syncPr}` });
        return NextResponse.json({ ok: true });
      }
      case "update": {
        if (!UPDATE_ACTIONS.includes(b.op)) return bad("أمر غير مسموح");
        const ids = Array.isArray(b.ids) ? b.ids.slice(0, 50) : [b.id];
        const results = [];
        for (const id of ids) {
          const s = await getStore(id);
          if (!s) continue;
          try {
            let r;
            if (dryRun || s.dryRun) r = { dry: true, would: `POST /update {"action":"${b.op}"}` };
            else if (b.op === "redeploy" && s.cloud?.envId && cloudToken()) r = (await lc(`/environments/${s.cloud.envId}/deployments`, { method: "POST" })).data?.attributes || { ok: true };
            else r = await cp(s, "update", "POST", { action: b.op });
            results.push({ id, name: s.name, ok: true, result: r });
            await logAction({ store: s.name, storeId: s.id, action: `أمر صيانة: ${b.op}${r.dry ? " (تجربة)" : ""}` });
          } catch (e) {
            results.push({ id, name: s.name, ok: false, error: e.message });
            await logAction({ store: s.name, storeId: s.id, ok: false, action: `فشل أمر: ${b.op}`, detail: e.message });
          }
        }
        return NextResponse.json({ results });
      }
      case "backups": {
        const s = await one();
        if (s.dryRun) return NextResponse.json({ backups: [], disk: "(تجربة)" });
        return NextResponse.json(await cp(s, "backups"));
      }
      case "backupNow": {
        const s = await one();
        if (dryRun || s.dryRun) return NextResponse.json({ dry: true });
        const r = await cp(s, "backups", "POST", {});
        await logAction({ store: s.name, storeId: s.id, action: "نسخة احتياطية يدوية", detail: r.name });
        return NextResponse.json(r);
      }
      case "setCanary": {
        const stores = await listStores();
        const current = await getRollout();
        if (current && rolloutBusy(current)) return bad("لا يمكن تغيير متجر التجربة أثناء النشر.");
        const decided = markCanary(stores, b.id);
        if (!decided.ok) return bad(decided.error);
        let updated = null;
        for (const p of decided.patches) {
          const s = await patchStore(p.id, { canary: p.canary });
          if (p.id === b.id) updated = s;
        }
        await logAction({ store: updated?.name, storeId: b.id, action: "تعيين متجر التجربة" });
        return NextResponse.json({ store: publicStore(updated) });
      }
      case "publish": {
        const current = (await getRollout()) || emptyRollout();
        if (rolloutBusy(current) || ["canary_pr", "canary_deploy", "promoting"].includes(current.phase)) return bad("هناك نشر جارٍ.");
        const stores = await listStores();
        const now = nowIso();
        const version = await templateVersion();
        const intent = publishIntent({ stores, mode: b.mode, confirmSlug: b.confirmSlug, templateVersion: version, now });
        if (!intent.ok) return bad(intent.error);
        let rollout = { ...intent.rollout, dry: dryRun || !!intent.canary.dryRun };
        const canary = await getStore(intent.canary.id);
        try {
          if (!canary) throw new Error("المتجر غير موجود");
          const raw = await syncStore({ store: canary, templateRepo: templateRepo(), mode: intent.mode, dryRun: dryRun || !!canary.dryRun });
          const r = rollout.dry && raw.status !== "dry" && raw.status !== "pr" ? { ...raw, status: "dry" } : raw;
          rollout = applySyncResult(rollout, canary, r, now);
          if (!(dryRun || canary.dryRun)) await rememberSync(canary, r);
          await logAction({ store: canary.name, storeId: canary.id, action: `نشر التحديث: ${r.status}${rollout.dry ? " (تجربة)" : ""}`, detail: r.prUrl || r.commit || "" });
        } catch (e) {
          rollout = failStore(rollout, canary.id, e.message, now);
          await logAction({ store: canary.name, storeId: canary.id, ok: false, action: "فشل نشر التحديث", detail: e.message });
        }
        await saveRollout(rollout);
        return NextResponse.json({ rollout: publicRollout(rollout) });
      }
      case "confirmPush": {
        const rollout0 = await getRollout();
        const canary = (await listStores()).find((s) => s.id === rollout0?.canaryId);
        const now = nowIso();
        const decided = confirmCanaryPush({ rollout: rollout0, canary, confirmSlug: b.confirmSlug, now });
        if (!decided.ok) return bad(decided.error);
        let rollout = decided.rollout;
        if (decided.merge) {
          if (dryRun || canary.dryRun) {
            rollout = { ...rollout, dry: true };
            rollout.stores = { ...rollout.stores, [canary.id]: { ...rollout.stores[canary.id], status: "dry", pushedSha: null } };
          } else {
            const merged = await mergeSyncPr(canary);
            const pushedSha = merged.sha || (await headSha(canary.repo, "main"));
            rollout = { ...rollout, stores: { ...rollout.stores, [canary.id]: { ...rollout.stores[canary.id], pushedSha, status: "starting", deployStartedAt: now } } };
            await patchStore(canary.id, { templateSha: canary.pendingTemplateSha || rollout.stores[canary.id].nextSha, syncPr: null, pendingTemplateSha: null, syncPrUrl: null });
            await logAction({ store: canary.name, storeId: canary.id, action: `دمج نشر متجر التجربة #${canary.syncPr}`, detail: pushedSha });
          }
        }
        await saveRollout(rollout);
        return NextResponse.json({ rollout: publicRollout(rollout) });
      }
      case "promote": {
        const rollout0 = await getRollout();
        const now = nowIso();
        const decided = beginPromote({ rollout: rollout0, stores: await listStores(), batchSize: b.batchSize, now });
        if (!decided.ok) return bad(decided.error);
        if (dryRun || decided.rollout.dry) return bad("وضع التجربة لا يعمّم على المتاجر.");
        await saveRollout(decided.rollout);
        await logAction({ action: "بدء تعميم التحديث", detail: `دفعة ${decided.rollout.batchSize}` });
        return NextResponse.json({ rollout: publicRollout(decided.rollout) });
      }
      case "cancelRollout": {
        const decided = cancelRollout(await getRollout(), nowIso());
        if (!decided.ok) return bad(decided.error);
        await saveRollout(decided.rollout);
        await logAction({ action: "إلغاء مسار النشر" });
        return NextResponse.json({ rollout: publicRollout(decided.rollout) });
      }
      case "rolloutTick": {
        const rollout = await rolloutTick();
        return NextResponse.json({ rollout: publicRollout(rollout) });
      }
      case "restore": {
        const s = await one();
        const name = String(b.name || "");
        if (!/^[\w.-]+$/.test(name)) return bad("اسم النسخة غير صالح");
        // تأكيد مزدوج: اسم النسخة مطابق + كتابة معرّف المتجر بيدك
        if (b.confirm !== name || String(b.confirmSlug || "").trim() !== s.slug) return bad("التأكيد غير مطابق. اكتب معرّف المتجر كما هو.");
        if (dryRun || s.dryRun) return NextResponse.json({ dry: true, would: `POST /backups/restore {"name":"${name}","confirm":"${name}"}` });
        const r = await cp(s, "backups/restore", "POST", { name, confirm: name });
        await logAction({ store: s.name, storeId: s.id, action: "استرجاع نسخة احتياطية", detail: `${name} ← نسخة قبل الاسترجاع: ${r.preRestoreBackup}` });
        return NextResponse.json(r);
      }
      default:
        return bad("إجراء غير معروف");
    }
  } catch (e) {
    return bad(msg(e), e.status === 404 ? 404 : 502);
  }
}
