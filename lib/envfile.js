// قراءة وكتابة ملفات .env (تعمل في المتصفح والخادم)

const KEY = /^[A-Za-z_][A-Za-z0-9_.-]*$/;

// يقرأ نص ملف .env إلى [{ key, value, note }] (التعليق فوق المتغير يصير ملاحظته)
export function parseEnv(text) {
  const out = [];
  const lines = String(text || "").replace(/\r\n?/g, "\n").split("\n");
  let note = "";
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) {
      note = "";
      continue;
    }
    if (line.startsWith("#")) {
      note = line.replace(/^#+\s*/, "");
      continue;
    }
    line = line.replace(/^export\s+/, "");
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    if (!KEY.test(key)) continue;
    let value = line.slice(eq + 1).trim();
    const q = value[0];
    if (q === '"' || q === "'" || q === "`") {
      // قيمة بين علامتي تنصيص، وقد تمتد لأكثر من سطر
      let rest = value.slice(1);
      while (!new RegExp(`(^|[^\\\\])${q === "`" ? "`" : q}\\s*(#.*)?$`).test(rest) && i + 1 < lines.length) rest += "\n" + lines[++i];
      const end = rest.search(new RegExp(`(?<!\\\\)${q}\\s*(#.*)?$`));
      value = end >= 0 ? rest.slice(0, end) : rest;
      if (q === '"') value = value.replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
    } else {
      value = value.replace(/\s+#.*$/, "");
    }
    const at = out.findIndex((x) => x.key === key);
    const item = { key, value, note };
    if (at >= 0) out[at] = item;
    else out.push(item);
    note = "";
  }
  return out;
}

// يكتب [{ key, value, note }] كنص .env
export function stringifyEnv(vars, header = "") {
  const quote = (v) => {
    const s = String(v ?? "");
    if (s === "" || /^[\w@%+=:,./-]+$/.test(s)) return s;
    return '"' + s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n") + '"';
  };
  const body = (vars || [])
    .filter((v) => v && KEY.test(v.key || ""))
    .map((v) => (v.note ? `# ${String(v.note).replace(/\n/g, " ")}\n` : "") + `${v.key}=${quote(v.value)}`)
    .join("\n");
  return (header ? header.split("\n").map((l) => `# ${l}`).join("\n") + "\n\n" : "") + body + "\n";
}
