// يرفع وثيقة أو أكثر (عرض سعر، عقد) من ملفات JSON إلى نظام الوثائق في الموقع، ويطبع رابط كل وثيقة /doc/<token>.
// الوثائق تُنشأ «مسودة»: راجعها من لوحة التحكم ← الوثائق ثم أرسل الرابط.
// عند رفع أكثر من ملف، كل وثيقة بعد الأولى تُربط بها (المرجع = رقم الوثيقة الأولى)، مثل عرض السعر ثم عقده.
//
// الاستخدام:
//   npm run push-doc -- docs-templates/law-office-local-hosting.quote.json docs-templates/law-office-local-hosting.json
// بيانات العميل الشخصية لا تُحفظ في المستودع، وتُمرَّر عند الرفع:
//   npm run push-doc -- ملف.json --name "اسم العميل" --phone 05xxxxxxxx --email x@y.com --city الرياض --company "اسم المنشأة"
// كلمة المرور تُقرأ من ADMIN_PASSWORD (من الشل أو من ملف .env.local)، وإلا يسألك عنها. الموقع من SITE_URL أو --site.
import { promises as fs } from "fs";
import path from "path";
import readline from "readline";

const ROOT = process.cwd();

async function loadEnvFile() {
  try {
    const text = await fs.readFile(path.join(ROOT, ".env.local"), "utf8");
    for (const line of text.split("\n")) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2");
    }
  } catch {}
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (a) => (rl.close(), resolve(a.trim()))));
}

function fail(msg) {
  console.error("✗ " + msg);
  process.exit(1);
}

// الملفات والخيارات (--name قيمة)
const files = [];
const opts = {};
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  const m = argv[i].match(/^--([a-z]+)$/);
  if (m) opts[m[1]] = argv[++i] ?? "";
  else files.push(argv[i]);
}

await loadEnvFile();
if (!files.length) fail("حدد ملف الوثيقة، مثال: npm run push-doc -- docs-templates/law-office-local-hosting.json");
const docs = [];
for (const file of files) {
  const doc = JSON.parse(await fs.readFile(path.resolve(ROOT, file), "utf8").catch(() => fail(`تعذرت قراءة ${file}`)));
  doc.client = { ...(doc.client || {}) };
  for (const k of ["name", "phone", "email", "city", "company", "idNumber"]) if (opts[k] !== undefined) doc.client[k] = opts[k];
  docs.push(doc);
}

const site = String(opts.site || process.env.SITE_URL || "https://www.hassandev.sa").replace(/\/+$/, "");
const password = process.env.ADMIN_PASSWORD || (await ask("كلمة مرور لوحة التحكم: "));
if (!password) fail("لا توجد كلمة مرور.");

const login = await fetch(`${site}/api/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ password }),
}).catch((e) => fail(`تعذر الاتصال بالموقع: ${e.message}`));
if (!login.ok) fail((await login.json().catch(() => ({}))).error || `فشل الدخول (${login.status})`);

const cookie = (login.headers.getSetCookie?.() || [login.headers.get("set-cookie")])
  .filter(Boolean)
  .map((c) => c.split(";")[0])
  .join("; ");

let first = null;
for (const doc of docs) {
  if (first && !doc.ref) doc.ref = first.number;
  const res = await fetch(`${site}/api/docs`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify(doc),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.item) fail(j.error || `تعذر إنشاء الوثيقة (${res.status})`);
  first = first || j.item;
  const kind = j.item.type === "contract" ? "عقد" : j.item.type === "quote" ? "عرض سعر" : j.item.type;
  console.log(`✓ ${kind} ${j.item.number} (مسودة)${j.item.ref ? ` — مرتبط بـ ${j.item.ref}` : ""}`);
  console.log(`  الرابط: ${site}/doc/${j.item.token}`);
}
