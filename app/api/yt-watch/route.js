import { kv } from "@vercel/kv";
import { assertTokenOr401 } from "../../../lib/auth.js";
import { keysForVideo } from "../../../lib/kvKeys.js";
import { sanitizeEvent } from "../../../lib/sanitize.js";

export async function POST(req) {
  const auth = assertTokenOr401(req);
  if (auth) return auth;

  let raw;
  try {
    raw = await req.json();
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  const evt = sanitizeEvent(raw);
  if (!evt.ok) return new Response(evt.error, { status: 400 });

  const { videoId, event } = evt.value;
  const keys = keysForVideo(videoId);

  // Log debug (tous events) — utile au début
  await kv.lpush(keys.events, JSON.stringify(evt.value));
  await kv.ltrim(keys.events, 0, 4999);
  await kv.expire(keys.events, 60 * 60 * 24 * 14); // 14 jours

  // Stats propres: on ne garde que les "final"
  if (event === "final") {
    await kv.lpush(keys.finals, JSON.stringify(evt.value));
    await kv.ltrim(keys.finals, 0, 999); // 1000 sessions max
    await kv.expire(keys.finals, 60 * 60 * 24 * 90); // 90 jours
  }

  return new Response("OK", { status: 200 });
}
