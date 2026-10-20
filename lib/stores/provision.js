import crypto from "crypto";
import { gh, headSha, readFile, b64, ghOwner } from "./github.js";
import { lc, cloudRegion, dnsRecords } from "./cloud.js";
import { cpCall } from "./signing.js";

// خطوات إنشاء متجر عميل جديد. كل خطوة تُستدعى لوحدها من اللوحة (حتى لا تتجاوز مهلة Vercel)
export const STEPS = [
  ["repo", "إنشاء مستودع العميل من القالب"],
  ["brand", "حفظ هوية المتجر (brand.json)"],
  ["app", "إنشاء التطبيق على Laravel Cloud"],
  ["database", "إنشاء قاعدة بيانات Laravel Cloud (Serverless Postgres)"],
  ["attach", "ربط قاعدة البيانات وأوامر البناء"],
  ["storage", "تخزين النسخ الاحتياطية (Laravel Cloud Object Storage)"],
  ["env", "متغيرات البيئة والمفتاح السري"],
  ["deploy", "النشر"],
  ["domain", "إضافة الدومين وسجلات DNS"],
  ["verify", "فحص الاتصال بالمتجر"],
];

// متغيرات لا تُنسخ من بيئة القالب (تخص كل متجر أو أسرار تكاملات)
const NO_COPY = /^(APP_KEY|APP_NAME|APP_URL|DEMO_MODE$|FAKE_INTEGRATIONS$|ADMIN_EMAIL$|DB_|CONTROL_PLANE_|LARAVEL_CLOUD_|AWS_|BACKUP_DISK$)|KEY|SECRET|TOKEN|PASSWORD|WEBHOOK/i;
export const baseEnvFrom = (vars = []) => vars.filter((v) => v?.key && !NO_COPY.test(v.key)).map((v) => ({ key: v.key, value: String(v.value ?? "") }));

export const BACKUP_DISK = "backups";
export const repoName = (slug) => `store-${slug}`;
const fake = (p) => `${p}-dry-${crypto.randomBytes(4).toString("hex")}`;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export function brandJson(text, s) {
  const j = JSON.parse(text);
  j.id = s.slug;
  j.name = { ...(j.name || {}), ar: s.name, en: s.nameEn || j.name?.en || s.slug };
  if (s.domain) j.domain = s.domain;
  j.theme = j.theme || {};
  j.theme.colors = { ...(j.theme.colors || {}), ...(s.primary ? { primary: s.primary } : {}), ...(s.secondary ? { secondary: s.secondary } : {}) };
  return JSON.stringify(j, null, 2) + "\n";
}

async function templateCloudEnv(templateRepo, o) {
  const apps = await lc("/applications", o);
  const app = apps.data.find((a) => a.attributes?.repository?.full_name === templateRepo);
  if (!app) return null;
  const full = await lc(`/applications/${app.id}?include=environments`, o);
  return (full.included || []).find((e) => e.type === "environments" && e.attributes?.name === "production")?.attributes || null;
}

// يشغّل خطوة واحدة ويعيد { detail, store: حقول تُحفظ، secrets?, done? }
export async function runStep(step, s, { templateRepo, dryRun, o = {}, secrets = {} }) {
  const owner = ghOwner();
  const repo = s.repo || `${owner}/${repoName(s.slug)}`;
  const ids = s.cloud || {};

  switch (step) {
    case "repo": {
      const tplSha = dryRun ? (await headSha(templateRepo, "main", o).catch(() => "dry")) : await headSha(templateRepo, "main", o);
      if (dryRun) return { detail: `سيُنشأ ${repo} (خاص) من ${templateRepo}@${String(tplSha).slice(0, 7)}`, store: { repo, templateSha: tplSha } };
      try {
        await gh(`/repos/${templateRepo}/generate`, { ...o, method: "POST", body: { owner, name: repoName(s.slug), private: true, description: `متجر ${s.name} (من قالب ${templateRepo})` } });
      } catch (e) {
        if (e.status !== 422) throw e; // موجود مسبقاً: نكمل عليه
      }
      return { detail: `https://github.com/${repo}`, store: { repo, templateSha: tplSha } };
    }
    case "brand": {
      if (dryRun) return { detail: `سيُحدَّث brand/brand.json: الاسم «${s.name}»${s.domain ? `، الدومين ${s.domain}` : ""}${s.primary ? `، اللون ${s.primary}` : ""}` };
      let file;
      for (let i = 0; i < 6 && !file; i++) {
        file = await readFile(repo, "brand/brand.json", "main", o).catch((e) => (e.status === 404 || e.status === 409 ? null : Promise.reject(e)));
        if (!file) await wait(2500);
      }
      if (!file) throw new Error("المستودع لم يجهز بعد، أعد المحاولة بعد دقيقة");
      await gh(`/repos/${repo}/contents/brand/brand.json`, { ...o, method: "PUT", body: { message: `Brand: ${s.slug}`, content: b64(brandJson(file.text, s)), sha: file.sha, branch: "main" } });
      if (s.logoUrl) {
        const r = await fetch(s.logoUrl);
        if (!r.ok) throw new Error("تعذر تنزيل الشعار من الرابط");
        const type = r.headers.get("content-type") || "";
        if (!/svg/.test(type)) return { detail: "حُفظت الهوية. الشعار ليس SVG، ارفعه من لوحة المتجر (الهوية)." };
        const cur = await readFile(repo, "brand/assets/logo.svg", "main", o).catch(() => null);
        await gh(`/repos/${repo}/contents/brand/assets/logo.svg`, { ...o, method: "PUT", body: { message: "Brand logo", content: Buffer.from(await r.arrayBuffer()).toString("base64"), sha: cur?.sha, branch: "main" } });
      }
      return { detail: "brand.json محدّث" };
    }
    case "app": {
      if (ids.appId) return { detail: `موجود: ${ids.appId}` };
      const body = { repository: repo, name: s.slug, region: cloudRegion(), source_control_provider_type: "github" };
      if (dryRun) return { detail: `POST /applications ${JSON.stringify(body)}`, store: { cloud: { ...ids, appId: fake("app"), envId: fake("env"), vanity: `${s.slug}-production-xxxx.laravel.cloud` } } };
      const app = await lc("/applications", { ...o, method: "POST", body });
      const full = await lc(`/applications/${app.data.id}?include=environments`, o);
      const env = (full.included || []).find((e) => e.type === "environments");
      const vanity = env?.attributes?.vanity_domain || "";
      return { detail: `${app.data.id} / ${env?.id || "?"}`, store: { cloud: { ...ids, appId: app.data.id, envId: env?.id, vanity }, baseUrl: s.baseUrl || (vanity ? `https://${vanity}` : "") } };
    }
    case "database": {
      if (ids.clusterId) return { detail: `موجودة: ${ids.clusterId}` };
      const body = { type: "neon_serverless_postgres", version: "18", name: `${s.slug}-db`, region: cloudRegion(), config: { cu_min: 0.25, cu_max: 0.25, suspend_seconds: 300, retention_days: 1 }, create_default_database: true };
      if (dryRun) return { detail: `POST /databases/clusters ${JSON.stringify(body)}`, store: { cloud: { ...ids, clusterId: fake("db"), schemaId: fake("schema") } } };
      const c = await lc("/databases/clusters?include=databases", { ...o, method: "POST", body });
      const schemaId = c.data?.relationships?.databases?.data?.[0]?.id || (c.included || []).find((x) => x.type === "databaseSchemas")?.id;
      return { detail: `${c.data.id}`, store: { cloud: { ...ids, clusterId: c.data.id, schemaId } } };
    }
    case "attach": {
      const tplEnv = await templateCloudEnv(templateRepo, o).catch(() => null);
      let schemaId = ids.schemaId;
      if (!dryRun && !schemaId) {
        const c = await lc(`/databases/clusters/${ids.clusterId}?include=databases`, o);
        schemaId = (c.included || [])[0]?.id;
      }
      const body = { database_schema_id: schemaId, build_command: tplEnv?.build_command, deploy_command: tplEnv?.deploy_command, uses_push_to_deploy: true };
      if (dryRun) return { detail: `PATCH /environments/${ids.envId} database_schema_id + أوامر البناء${tplEnv ? " (منسوخة من القالب)" : ""}` };
      if (!schemaId) throw new Error("قاعدة البيانات لم تجهز بعد، أعد المحاولة بعد دقيقة");
      await lc(`/environments/${ids.envId}`, { ...o, method: "PATCH", body: Object.fromEntries(Object.entries(body).filter(([, v]) => v != null)) });
      return { detail: "مربوطة", store: { cloud: { ...ids, schemaId } } };
    }
    case "storage": {
      // حاوية خاصة على Laravel Cloud نفسها، تُربط بالبيئة كقرص باسم backups
      const body = { name: `${s.slug}-backups`.slice(0, 40), visibility: "private", jurisdiction: "default", key_name: `${s.slug}-app`.slice(0, 40), key_permission: "read_write" };
      if (dryRun) return { detail: `POST /buckets ${JSON.stringify(body)} ثم PATCH /environments/${ids.envId} filesystem_keys [{disk:"${BACKUP_DISK}"}]`, store: { cloud: { ...ids, bucketId: ids.bucketId || fake("bucket"), bucketKeyId: ids.bucketKeyId || fake("key") } } };
      let bucketId = ids.bucketId, keyId = ids.bucketKeyId;
      if (!bucketId) {
        const bk = await lc("/buckets?include=keys", { ...o, method: "POST", body });
        bucketId = bk.data.id;
        keyId = bk.data?.relationships?.keys?.data?.[0]?.id || (bk.included || []).find((x) => x.type === "filesystemKeys")?.id;
      }
      if (!keyId) {
        const ks = await lc(`/buckets/${bucketId}/keys`, o);
        keyId = ks.data?.[0]?.id;
      }
      if (!keyId) throw new Error("لم يُعثر على مفتاح الحاوية، أعد المحاولة");
      // بيئة جديدة: لا يوجد أقراص أخرى. إن وُجدت حاويات أخرى مربوطة لا نستبدلها
      const env = await lc(`/environments/${ids.envId}?include=buckets`, o);
      const others = (env?.data?.relationships?.buckets?.data || []).filter((b) => b.id !== bucketId);
      if (others.length) throw new Error("البيئة مربوطة بحاويات أخرى؛ اربط حاوية النسخ يدوياً من Laravel Cloud");
      const existing = [];
      await lc(`/environments/${ids.envId}`, { ...o, method: "PATCH", body: { filesystem_keys: [...existing, { id: keyId, disk: BACKUP_DISK, is_default_disk: false }] } });
      return { detail: `${bucketId} مربوطة كقرص ${BACKUP_DISK}`, store: { cloud: { ...ids, bucketId, bucketKeyId: keyId } } };
    }
    case "env": {
      const cpSecret = secrets.cpSecret || crypto.randomBytes(32).toString("hex");
      // يُولَّد مرة واحدة ويُحفظ، حتى لا تتغير مفاتيح التشفير عند إعادة الخطوة
      // حساب مالك المتجر: بريد وكلمة مرور قوية (بدل admin@example.com / password الافتراضية في البذور)
      const adminEmail = s.adminEmail || `admin@${s.domain || `${s.slug}.store`}`;
      const adminPassword = secrets.adminPassword || crypto.randomBytes(12).toString("base64url");
      const appKey = secrets.appKey || "base64:" + crypto.randomBytes(32).toString("base64");
      // رابط Laravel Cloud أولاً حتى يعمل المتجر قبل ضبط DNS؛ يُحوَّل للدومين بعد التحقق
      const url = s.baseUrl || (ids.vanity ? `https://${ids.vanity}` : s.domain ? `https://${s.domain}` : "");
      const tplEnv = await templateCloudEnv(templateRepo, o).catch(() => null);
      const vars = [
        ...baseEnvFrom(tplEnv?.environment_variables),
        { key: "APP_KEY", value: appKey },
        { key: "APP_NAME", value: s.name },
        { key: "APP_URL", value: url },
        { key: "CONTROL_PLANE_SECRET", value: cpSecret },
        { key: "CONTROL_PLANE_STORE_ID", value: s.slug },
        { key: "BACKUP_DISK", value: BACKUP_DISK },
        { key: "ADMIN_EMAIL", value: adminEmail },
        { key: "ADMIN_PASSWORD", value: adminPassword },
      ];
      if (dryRun) return { detail: `POST /environments/${ids.envId}/variables (${vars.length} متغير): ${vars.map((v) => v.key).join(", ")}`, secrets: { cpSecret, appKey, adminPassword }, store: { adminEmail } };
      await lc(`/environments/${ids.envId}/variables`, { ...o, method: "POST", body: { method: "set", variables: vars } });
      return { detail: `${vars.length} متغير (المالك: ${adminEmail})`, secrets: { cpSecret, appKey, adminPassword }, store: { adminEmail } };
    }
    case "deploy": {
      if (dryRun) return { detail: `POST /environments/${ids.envId}/deployments` };
      const d = await lc(`/environments/${ids.envId}/deployments`, { ...o, method: "POST" });
      return { detail: `${d.data?.id} (${d.data?.attributes?.status || "queued"})`, store: { cloud: { ...ids, lastDeployId: d.data?.id } } };
    }
    case "domain": {
      if (!s.domain) return { detail: "بدون دومين (يعمل على رابط Laravel Cloud)" };
      if (dryRun) return { detail: `POST /environments/${ids.envId}/domains {"name":"${s.domain}"}`, store: { dns: [{ type: "CNAME", name: s.domain, value: "(يظهر بعد الإنشاء الفعلي)" }] } };
      // الدومين الرئيسي + www للدومينات الجذرية (example.sa)
      const add = (name) => lc(`/environments/${ids.envId}/domains`, { ...o, method: "POST", body: { name, verification_method: "real_time" } });
      const d = ids.domainId ? await lc(`/domains/${ids.domainId}`, o) : await add(s.domain);
      const isApex = s.domain.split(".").length === 2;
      const w = !isApex ? null : ids.wwwDomainId ? await lc(`/domains/${ids.wwwDomainId}`, o) : await add(`www.${s.domain}`).catch(() => null);
      return { detail: `${d.data?.id}${w ? ` + www ${w.data?.id}` : ""}`, store: { dns: [...dnsRecords(d), ...(w ? dnsRecords(w) : [])], cloud: { ...ids, domainId: d.data?.id, wwwDomainId: w?.data?.id } } };
    }
    case "verify": {
      if (dryRun) return { detail: "GET /api/control-plane/v1/version (موقّع)" };
      const v = await cpCall({ baseUrl: s.baseUrl, secret: secrets.cpSecret, endpoint: "version", ...o.cp });
      return { detail: `يعمل، نسخة القالب ${v.templateVersion || "?"}` };
    }
    default:
      throw new Error("خطوة غير معروفة");
  }
}
