// يرفع وثيقة (عرض سعر أو عقد) من ملف JSON إلى نظام الوثائق في الموقع، ويطبع رابطها الرسمي /doc/<token>.
// الوثيقة تُنشأ «مسودة»: راجعها من لوحة التحكم ← الوثائق ثم أكمل بيانات العميل وأرسل الرابط.
//
// الاستخدام:
//   npm run push-doc -- docs-templates/law-office-local-hosting.json
//   npm run push-doc -- docs-templates/law-office-local-hosting.json https://www.hassandev.sa
// كلمة المرور تُقرأ من ADMIN_PASSWORD (من الشل أو من ملف .env.local)، وإلا يسألك عنها.
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

await loadEnvFile();
const file = process.argv[2];
if (!file) fail("حدد ملف الوثيقة، مثال: npm run push-doc -- docs-templates/law-office-local-hosting.json");
const doc = JSON.parse(await fs.readFile(path.resolve(ROOT, file), "utf8").catch(() => fail(`تعذرت قراءة ${file}`)));
const site = String(process.argv[3] || process.env.SITE_URL || "https://www.hassandev.sa").replace(/\/+$/, "");
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
const res = await fetch(`${site}/api/docs`, {
  method: "POST",
  headers: { "Content-Type": "application/json", cookie },
  body: JSON.stringify(doc),
});
const j = await res.json().catch(() => ({}));
if (!res.ok || !j.item) fail(j.error || `تعذر إنشاء الوثيقة (${res.status})`);
console.log(`✓ تم إنشاء ${j.item.number} (مسودة)`);
console.log(`  الرابط: ${site}/doc/${j.item.token}`);
