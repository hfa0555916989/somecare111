import { Redis } from "@upstash/redis";
import { defaultContent, mergeContent } from "./defaults";

const KEY = "site:content";

function client() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export function dbConnected() {
  return !!client();
}

export async function getContent() {
  const r = client();
  if (!r) return defaultContent;
  try {
    const stored = await r.get(KEY);
    if (stored) return mergeContent(stored);
  } catch (e) {
    console.error("DB read failed", e);
  }
  return defaultContent;
}

export async function saveContent(content) {
  const r = client();
  if (!r) throw new Error("DB_NOT_CONNECTED");
  await r.set(KEY, content);
}
