import crypto from "crypto";

// توقيع طلبات «لوحة المطوّر» للمتاجر (مطابق لـ VerifyControlPlaneSignature في قالب المتجر)
// signature = hex(HMAC-SHA256(secret, "{ts}\n{nonce}\n{METHOD}\n{/path}\n{rawBody}"))
export const CP_PREFIX = "/api/control-plane/v1";

export function cpSign(secret, ts, nonce, method, path, body = "") {
  const p = "/" + String(path).replace(/^\/+/, "");
  return crypto.createHmac("sha256", secret).update(`${ts}\n${nonce}\n${String(method).toUpperCase()}\n${p}\n${body}`).digest("hex");
}

export function cpHeaders(secret, method, path, body = "", now = Date.now()) {
  const ts = String(Math.floor(now / 1000));
  const nonce = crypto.randomBytes(16).toString("hex");
  return {
    "X-CP-Timestamp": ts,
    "X-CP-Nonce": nonce,
    "X-CP-Signature": cpSign(secret, ts, nonce, method, path, body),
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

export const cpErrors = {
  401: "التوقيع غير صحيح أو الوقت غير متزامن",
  403: "عنوان IP غير مسموح",
  404: "لوحة المطوّر غير مفعّلة في هذا المتجر (CONTROL_PLANE_SECRET غير مضبوط)",
  409: "طلب مكرر (nonce)",
  422: "بيانات غير صالحة",
  423: "يوجد استرجاع آخر قيد التنفيذ",
  429: "طلبات كثيرة، انتظر دقيقة",
};

// استدعاء موقّع لمتجر. fetchImpl للاختبارات
export async function cpCall({ baseUrl, secret, method = "GET", endpoint, payload, fetchImpl = fetch, timeoutMs = 25000 }) {
  if (!secret || secret.length < 32) throw new Error("مفتاح لوحة المطوّر لهذا المتجر غير محفوظ");
  const base = String(baseUrl || "").replace(/\/+$/, "");
  if (!/^https?:\/\//.test(base)) throw new Error("رابط المتجر غير صالح");
  const path = `${CP_PREFIX}/${String(endpoint).replace(/^\/+/, "")}`;
  const body = method === "GET" ? "" : JSON.stringify(payload ?? {});
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const r = await fetchImpl(base + path, { method, headers: cpHeaders(secret, method, path, body), body: method === "GET" ? undefined : body, signal: ctl.signal, cache: "no-store" });
    const j = await r.json().catch(() => ({}));
    if (!r.ok && !(endpoint === "health" && r.status === 503)) {
      const e = new Error(cpErrors[r.status] || j.message || `HTTP ${r.status}`);
      e.status = r.status;
      throw e;
    }
    return j && typeof j === "object" && "data" in j && Object.keys(j).length <= 2 ? j.data : j;
  } catch (e) {
    if (e.name === "AbortError") throw new Error("انتهت مهلة الاتصال بالمتجر");
    throw e;
  } finally {
    clearTimeout(t);
  }
}
