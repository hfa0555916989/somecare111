// آلة نشر التحديث: دوال خالصة بلا Redis ولا GitHub ولا شبكة.
// الطلب الواحد قصير (حد Vercel 60 ثانية) والواجهة تستدعي «نقرة» حتى يكتمل النشر.

export const ROLLOUT_TIMEOUT_MS = 8 * 60 * 1000;
export const DEFAULT_BATCH = 3;
export const MAX_LOG = 80;

export const STATUS_AR = {
  pending: "بالانتظار",
  syncing: "تجري المزامنة",
  pr_open: "طلب سحب مفتوح",
  starting: "بدء النشر",
  deploying: "بانتظار الصحة والنسخة",
  healthy: "سليم",
  failed: "فشل",
  reverting: "تراجع عن الالتزام",
  redeploying: "إعادة النشر",
  reverted: "تم التراجع",
  dry: "تجربة",
};

export const PHASE_AR = {
  idle: "لا يوجد نشر",
  canary_pr: "طلب سحب لمتجر التجربة",
  canary_deploy: "نشر متجر التجربة",
  canary_ok: "متجر التجربة سليم",
  promoting: "التعميم جارٍ",
  failed: "توقف بسبب فشل",
  done: "اكتمل",
};

const BANNED = new Set(["restore", "backup", "backups", "backups/restore"]);

export function clampBatch(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return DEFAULT_BATCH;
  return Math.min(10, Math.max(1, Math.round(x)));
}

export function versionsMatch(running, templateVersion) {
  const a = String(running ?? "").trim();
  const b = String(templateVersion ?? "").trim();
  return a !== "" && a === b;
}

// الصحة «ok» فقط. degraded أو down ليستا نجاحاً حتى لو تطابقت النسخة.
export function probeOk(health, version, templateVersion) {
  return health === "ok" && versionsMatch(version, templateVersion);
}

function blankStore(store = {}) {
  return {
    name: store.name || "",
    status: "pending",
    version: "",
    health: "",
    error: "",
    parent: null,
    commit: null,
    pushedSha: null,
    pr: null,
    prUrl: null,
    nextSha: null,
    prevTemplateSha: store.templateSha || null,
    deployStartedAt: null,
    reverted: false,
    revertSha: null,
    redeployOk: null,
  };
}

export function emptyRollout(now = new Date().toISOString()) {
  return {
    phase: "idle",
    canaryId: null,
    templateVersion: "",
    batchSize: DEFAULT_BATCH,
    queue: [],
    cursor: 0,
    activeId: null,
    stores: {},
    log: [],
    error: "",
    dry: false,
    startedAt: null,
    updatedAt: now,
    restoreDatabase: false,
  };
}

function pushLog(rollout, msg, storeId, now) {
  const log = [{ at: now, msg: String(msg).slice(0, 400), storeId: storeId || null }, ...(rollout.log || [])].slice(0, MAX_LOG);
  return { ...rollout, log, updatedAt: now, restoreDatabase: false };
}

export function markCanary(stores, id) {
  if (!stores.some((s) => s.id === id)) return { ok: false, error: "المتجر غير موجود" };
  return { ok: true, patches: stores.map((s) => ({ id: s.id, canary: s.id === id })) };
}

export function rolloutBusy(rollout) {
  if (!rollout || rollout.dry) return false;
  const live = (s) => s && ["starting", "deploying", "syncing", "reverting", "redeploying"].includes(s.status);
  if (rollout.phase === "promoting") return true;
  if (rollout.phase === "canary_deploy") return live(rollout.stores?.[rollout.canaryId]);
  return Object.values(rollout.stores || {}).some((s) => s.status === "reverting" || s.status === "redeploying");
}

export function canPromote(rollout) {
  if (!rollout || rolloutBusy(rollout)) return false;
  const canary = rollout.stores?.[rollout.canaryId];
  if (!canary || canary.status !== "healthy") return false;
  return rollout.phase === "canary_ok" || rollout.phase === "failed";
}

// نشر التحديث: طلب سحب فقط، أو دفع مباشر بعد كتابة معرّف متجر التجربة.
export function publishIntent({ stores, mode = "pr", confirmSlug = "", templateVersion = "", now }) {
  const canaries = (stores || []).filter((s) => s.canary);
  if (canaries.length !== 1) return { ok: false, error: canaries.length ? "حدّد متجر تجربة واحداً فقط." : "حدّد متجر تجربة واحداً قبل النشر." };
  const canary = canaries[0];
  const version = String(templateVersion || "").trim();
  if (!version) return { ok: false, error: "تعذر قراءة VERSION من قالب المتجر." };
  const direct = mode === "direct";
  if (direct && String(confirmSlug || "").trim() !== canary.slug) {
    return { ok: false, error: "الدفع المباشر يحتاج تأكيداً ثانياً: اكتب معرّف متجر التجربة.", needsConfirm: true };
  }
  const rollout = emptyRollout(now);
  rollout.phase = direct ? "canary_deploy" : "canary_pr";
  rollout.canaryId = canary.id;
  rollout.templateVersion = version;
  rollout.startedAt = now;
  rollout.activeId = canary.id;
  rollout.stores = { [canary.id]: { ...blankStore(canary), status: "syncing" } };
  const msg = direct
    ? `نشر التحديث على متجر التجربة «${canary.name}» بالدفع المباشر بعد التأكيد.`
    : `نشر التحديث على متجر التجربة «${canary.name}» كطلب سحب. لن يُدفع إلى main قبل التأكيد.`;
  return { ok: true, mode: direct ? "direct" : "pr", canary, push: direct, rollout: pushLog(rollout, msg, canary.id, now) };
}

export function applySyncResult(rollout, store, result, now) {
  const prev = rollout.stores?.[store.id] || {};
  const st = {
    ...blankStore(store),
    ...prev,
    name: store.name,
    nextSha: result.nextSha || prev.nextSha || null,
    parent: result.parent || prev.parent || null,
    commit: result.commit || prev.commit || null,
    pr: result.pr ?? prev.pr ?? null,
    prUrl: result.prUrl ?? prev.prUrl ?? null,
    prevTemplateSha: prev.prevTemplateSha || store.templateSha || null,
  };
  let phase = rollout.phase;
  let error = rollout.error || "";
  let msg;
  const canaryPhase = store.id === rollout.canaryId && phase !== "promoting";
  if (result.status === "dry") {
    st.status = "dry";
    st.pushedSha = null;
    if (canaryPhase) phase = "canary_pr";
    msg = `تجربة فقط على «${store.name}»: لم يُدفع شيء ولم يُنشر.`;
  } else if (result.status === "pr") {
    st.status = "pr_open";
    st.pushedSha = null;
    if (canaryPhase) phase = "canary_pr";
    msg = `فُتح طلب سحب لـ«${store.name}». لن يُنشر حتى تأكيد الدمج.`;
  } else if (result.status === "pushed") {
    st.status = "starting";
    st.deployStartedAt = now;
    st.pushedSha = result.commit || null;
    if (canaryPhase) phase = "canary_deploy";
    msg = `دُفع تحديث «${store.name}» إلى main. بانتظار نشر Laravel Cloud.`;
  } else if (result.status === "uptodate" || result.status === "nothing") {
    st.status = "deploying";
    st.deployStartedAt = st.deployStartedAt || now;
    if (canaryPhase) phase = "canary_deploy";
    msg = result.status === "nothing"
      ? `لا ملفات جديدة لـ«${store.name}». نتحقق من النسخة العاملة.`
      : `مستودع «${store.name}» يطابق القالب. نتحقق أن النسخة العاملة هي ${rollout.templateVersion}.`;
  } else {
    st.status = "failed";
    st.error = result.error || "تعذر المزامنة";
    error = st.error;
    phase = "failed";
    msg = `فشلت مزامنة «${store.name}»: ${st.error}`;
  }
  return pushLog({ ...rollout, phase, error, stores: { ...rollout.stores, [store.id]: st }, activeId: store.id }, msg, store.id, now);
}

export function confirmCanaryPush({ rollout, canary, confirmSlug, now }) {
  if (!rollout || rollout.phase !== "canary_pr") return { ok: false, error: "لا يوجد طلب نشر بانتظار التأكيد." };
  if (!canary || canary.id !== rollout.canaryId || !canary.canary) return { ok: false, error: "متجر التجربة غير مطابق." };
  if (String(confirmSlug || "").trim() !== canary.slug) return { ok: false, error: "اكتب معرّف متجر التجربة للتأكيد.", needsConfirm: true };
  const prev = rollout.stores[canary.id] || blankStore(canary);
  if (prev.status === "dry" || rollout.dry) {
    const st = { ...prev, name: canary.name, status: "dry", pushedSha: null };
    return { ok: true, merge: false, rollout: pushLog({ ...rollout, dry: true, stores: { ...rollout.stores, [canary.id]: st } }, "تجربة: لم يُدمج الطلب ولم يُنشر شيء.", canary.id, now) };
  }
  const st = { ...prev, name: canary.name, status: "starting", deployStartedAt: now };
  return {
    ok: true,
    merge: !!prev.pr,
    rollout: pushLog({ ...rollout, phase: "canary_deploy", activeId: canary.id, stores: { ...rollout.stores, [canary.id]: st } }, `تم تأكيد نشر متجر التجربة «${canary.name}».`, canary.id, now),
  };
}

export function cancelRollout(rollout, now) {
  if (!rollout) return { ok: false, error: "لا يوجد نشر." };
  if (rollout.phase === "canary_deploy" || rollout.phase === "promoting") return { ok: false, error: "النشر بدأ. عند الفشل يُتراجع تلقائياً عن التزام ذلك المتجر." };
  if (Object.values(rollout.stores || {}).some((s) => s.status === "reverting" || s.status === "redeploying")) return { ok: false, error: "التراجع لم يكتمل." };
  if (rollout.phase !== "canary_pr" && rollout.phase !== "failed") return { ok: false, error: "لا يوجد ما يُلغى." };
  return { ok: true, rollout: pushLog({ ...rollout, phase: "idle", activeId: null }, "أُلغي مسار النشر. لم يُمس main إن كان الطلب ما زال مفتوحاً، ولم تُسترجع قاعدة البيانات.", null, now) };
}

export function beginPromote({ rollout, stores, batchSize, now }) {
  if (!canPromote(rollout)) return { ok: false, error: "التعميم متاح بعد أن يصبح متجر التجربة سليماً ونسخته مطابقة للقالب." };
  const size = clampBatch(batchSize ?? rollout.batchSize);
  const rest = (stores || []).filter((s) => s.id !== rollout.canaryId && rollout.stores?.[s.id]?.status !== "healthy");
  if (!rest.length) {
    return { ok: true, rollout: pushLog({ ...rollout, phase: "done", queue: [], cursor: 0, batchSize: size, activeId: null }, "لا توجد متاجر أخرى. اكتمل النشر.", null, now) };
  }
  const queue = rest.map((s) => s.id);
  const map = { ...rollout.stores };
  for (const s of rest) {
    map[s.id] = { ...blankStore(s), ...(map[s.id] || {}), name: s.name, status: "pending", error: "", deployStartedAt: null, pushedSha: null, commit: null, parent: null, reverted: false };
  }
  return {
    ok: true,
    rollout: pushLog(
      { ...rollout, phase: "promoting", batchSize: size, queue, cursor: 0, activeId: queue[0], stores: map, error: "" },
      `بدء التعميم على ${queue.length} متجراً، دفعات من ${size}. يتوقف عند أول فشل.`,
      null,
      now,
    ),
  };
}

export function currentTarget(rollout) {
  if (!rollout) return null;
  if (rollout.phase === "canary_deploy") return rollout.canaryId;
  if (rollout.phase === "promoting") return rollout.queue?.[rollout.cursor] || null;
  return null;
}

// ما يُسمح به عند الفشل: تراجع عن التزام المزامنة ثم إعادة النشر. لا استرجاع لقاعدة البيانات أبداً.
export function failureActions(st) {
  const revert = !!(st && st.pushedSha && st.parent && st.deployStartedAt && !st.reverted);
  const actions = revert ? ["revert_commit", "redeploy"] : [];
  if (actions.some((a) => BANNED.has(a))) return { actions: [], restoreDatabase: false };
  return { actions, restoreDatabase: false };
}

export function failStore(rollout, storeId, reason, now) {
  const prev = rollout.stores?.[storeId] || {};
  if (["reverting", "redeploying", "reverted"].includes(prev.status)) return rollout;
  const shouldRevert = failureActions(prev).actions.includes("revert_commit");
  const st = { ...prev, error: reason, status: shouldRevert ? "reverting" : "failed" };
  const name = st.name || storeId;
  const msg = shouldRevert
    ? `فشل «${name}»: ${reason} سيُتراجع عن التزام التحديث ثم يُعاد النشر. لن تُسترجع قاعدة البيانات.`
    : `فشل «${name}»: ${reason} لم يُدفع التزام إلى main، فلا تراجع. لن تُسترجع قاعدة البيانات.`;
  return pushLog({ ...rollout, phase: "failed", error: reason, activeId: storeId, stores: { ...rollout.stores, [storeId]: st } }, msg, storeId, now);
}

export function noteTimeout(rollout, nowMs, timeoutMs = ROLLOUT_TIMEOUT_MS) {
  if (!rollout) return rollout;
  const id = currentTarget(rollout);
  if (!id) return rollout;
  const st = rollout.stores?.[id];
  if (!st || (st.status !== "deploying" && st.status !== "starting")) return rollout;
  const started = Date.parse(st.deployStartedAt || "");
  if (!Number.isFinite(started) || nowMs - started < timeoutMs) return rollout;
  return failStore(rollout, id, "انتهت مهلة انتظار النشر. الصحة أو النسخة لم تطابق القالب.", new Date(nowMs).toISOString());
}

export function applyDeployKick(rollout, storeId, { ok, skipped, error } = {}, now) {
  const st = { ...(rollout.stores?.[storeId] || {}), status: "deploying", deployStartedAt: rollout.stores?.[storeId]?.deployStartedAt || now };
  const name = st.name || storeId;
  const msg = skipped
    ? `«${name}»: لا يوجد نداء Laravel Cloud. نواصل فحص الصحة والنسخة. لم تُسترجع قاعدة البيانات.`
    : ok
      ? `«${name}»: طُلب نشر Laravel Cloud. ننتظر أن تصبح الصحة سليمة والنسخة ${rollout.templateVersion}.`
      : `«${name}»: تعذر طلب النشر (${error || "خطأ"}). نواصل فحص الصحة.`;
  return pushLog({ ...rollout, stores: { ...rollout.stores, [storeId]: st } }, msg, storeId, now);
}

export function applyProbe(rollout, storeId, { health, version, error } = {}, now, nowMs = Date.parse(now)) {
  const st0 = rollout.stores?.[storeId];
  if (!st0 || st0.status !== "deploying") return rollout;
  const name = st0.name || storeId;
  if (!error && probeOk(health, version, rollout.templateVersion)) {
    const st = { ...st0, status: "healthy", health, version: String(version).trim(), error: "" };
    let next = pushLog({ ...rollout, stores: { ...rollout.stores, [storeId]: st } }, `«${name}» سليم والنسخة تطابق ${rollout.templateVersion}.`, storeId, now);
    if (storeId === next.canaryId && next.phase === "canary_deploy") {
      return pushLog({ ...next, phase: "canary_ok", activeId: null }, "متجر التجربة سليم. يمكن التعميم على بقية المتاجر.", storeId, now);
    }
    if (next.phase === "promoting") {
      const cursor = next.cursor + 1;
      if (cursor >= next.queue.length) return pushLog({ ...next, phase: "done", cursor, activeId: null }, "اكتمل التعميم على كل المتاجر.", null, now);
      const size = next.batchSize || DEFAULT_BATCH;
      const msg = cursor % size === 0 ? `اكتملت الدفعة ${cursor / size}. تبدأ الدفعة التالية.` : "المتجر التالي في الدفعة.";
      return pushLog({ ...next, cursor, activeId: next.queue[cursor] }, msg, next.queue[cursor], now);
    }
    return next;
  }
  const timed = noteTimeout(rollout, nowMs);
  if (timed !== rollout && timed.stores?.[storeId]?.status !== "deploying") return timed;
  const st = { ...st0, health: health || "", version: version || "", error: error || st0.error || "" };
  const same = st0.health === st.health && st0.version === st.version && (st0.error || "") === (st.error || "");
  const why = error ? `تعذر الفحص: ${error}` : health !== "ok" ? `الصحة «${health || "غير معروفة"}» وليست سليمة.` : `النسخة العاملة «${version || "?"}» لا تطابق قالب ${rollout.templateVersion || "?"}.`;
  const next = { ...rollout, stores: { ...rollout.stores, [storeId]: st }, updatedAt: now };
  return same ? next : pushLog(next, `«${name}»: ${why}`, storeId, now);
}

export function applyRevert(rollout, storeId, { ok, revertSha, error } = {}, now) {
  const st = { ...(rollout.stores?.[storeId] || {}) };
  const name = st.name || storeId;
  if (!ok) {
    st.status = "failed";
    st.error = error || "تعذر التراجع عن الالتزام";
    return pushLog({ ...rollout, phase: "failed", error: st.error, stores: { ...rollout.stores, [storeId]: st } }, `تعذر التراجع عن «${name}»: ${st.error}. لم تُسترجع قاعدة البيانات.`, storeId, now);
  }
  st.reverted = true;
  st.revertSha = revertSha || null;
  st.status = "redeploying";
  return pushLog({ ...rollout, phase: "failed", stores: { ...rollout.stores, [storeId]: st } }, `تُراجع عن التزام «${name}». ستُعاد النشر. قاعدة البيانات لن تُسترجع.`, storeId, now);
}

export function applyRedeploy(rollout, storeId, { ok, skipped, error } = {}, now) {
  const prev = rollout.stores?.[storeId] || {};
  const name = prev.name || storeId;
  const st = { ...prev, status: "reverted", redeployOk: !!(ok || skipped), error: !ok && !skipped ? error || prev.error : prev.error };
  const msg = skipped
    ? `لا يوجد تطبيق Laravel Cloud لـ«${name}»، لم تُعد النشر. قاعدة البيانات لم تُسترجع.`
    : ok
      ? `أُعيد نشر «${name}» بعد التراجع. قاعدة البيانات لم تُسترجع.`
      : `تُراجع الكود لكن إعادة النشر فشلت: ${error || "خطأ"}. قاعدة البيانات لم تُسترجع.`;
  return pushLog({ ...rollout, phase: "failed", stores: { ...rollout.stores, [storeId]: st }, error: rollout.error || (!ok && !skipped ? error : rollout.error) || "" }, msg, storeId, now);
}

export function nextAction(rollout) {
  if (!rollout) return { type: "none", restoreDatabase: false };
  const entries = Object.entries(rollout.stores || {});
  const reverting = entries.find(([, s]) => s.status === "reverting");
  if (reverting) {
    const plan = failureActions(reverting[1]);
    return { type: "revert", storeId: reverting[0], parent: reverting[1].parent, pushedSha: reverting[1].pushedSha, actions: plan.actions, restoreDatabase: false };
  }
  const redeploying = entries.find(([, s]) => s.status === "redeploying");
  if (redeploying) return { type: "redeploy", storeId: redeploying[0], restoreDatabase: false };
  if (["idle", "canary_ok", "done", "failed", "canary_pr"].includes(rollout.phase)) return { type: "none", restoreDatabase: false };
  const id = currentTarget(rollout);
  if (!id) return { type: rollout.phase === "promoting" ? "finish" : "none", restoreDatabase: false };
  const st = rollout.stores[id] || { status: "pending" };
  if (st.status === "pending" || st.status === "syncing") return { type: "sync", storeId: id, mode: "direct", restoreDatabase: false };
  if (st.status === "starting") return { type: "kick", storeId: id, restoreDatabase: false };
  if (st.status === "deploying") return { type: "probe", storeId: id, restoreDatabase: false };
  return { type: "none", restoreDatabase: false };
}

export function finishIfDrained(rollout, now) {
  if (!rollout || rollout.phase !== "promoting") return rollout;
  if (rollout.queue?.[rollout.cursor]) return rollout;
  return pushLog({ ...rollout, phase: "done", activeId: null }, "اكتمل التعميم على كل المتاجر.", null, now);
}

export function publicRollout(rollout) {
  const base = rollout && typeof rollout === "object" ? rollout : emptyRollout();
  const stores = {};
  for (const [id, st] of Object.entries(base.stores || {})) {
    if (!st || typeof st !== "object") continue;
    const { secret, cpSecret, ...rest } = st;
    stores[id] = rest;
  }
  const { secret, cpSecret, ticking, tickStartedAt, ...rest } = base;
  return { ...rest, stores, restoreDatabase: false };
}
