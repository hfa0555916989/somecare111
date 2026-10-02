// ينزّل محتوى الموقع الحالي (كل تعديلات لوحة التحكم) ويحفظه في .data/content.json
// وهو نفس الملف الذي يقرأ منه الموقع عند تشغيله على جهازك بـ npm run dev.
//
// الاستخدام:
//   npm run pull
//   npm run pull -- https://www.hassandev.sa
// كلمة المرور تُقرأ من ADMIN_PASSWORD (من الشل أو من ملف .env.local)، وإلا يسألك عنها.
import { promises as fs } from "fs";
import path from "path";
import readline from "readline";

const ROOT = process.cwd();
const OUT = path.join(ROOT, ".data", "content.json");

// قراءة متغيرات .env.local إن وجد (بدون مكتبات إضافية)
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
const site = String(process.argv[2] || process.env.SITE_URL || "https://www.hassandev.sa").replace(/\/+$/, "");
const password = process.env.ADMIN_PASSWORD || (await ask("كلمة مرور لوحة التحكم: "));
if (!password) fail("لا توجد كلمة مرور.");

console.log(`… تنزيل المحتوى من ${site}`);
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
const res = await fetch(`${site}/api/content`, { headers: { cookie } });
if (!res.ok) fail(`تعذر تنزيل المحتوى (${res.status})`);
const { content } = await res.json();
if (!content?.brand) fail("الرد لا يحتوي على محتوى الموقع.");

await fs.mkdir(path.dirname(OUT), { recursive: true });
// النسخة السابقة تُحفظ باسم content.prev.json احتياطاً
await fs.copyFile(OUT, OUT.replace(/\.json$/, ".prev.json")).catch(() => {});
await fs.writeFile(OUT, JSON.stringify(content, null, 2));
console.log(`✓ تم الحفظ في ${path.relative(ROOT, OUT)}`);
