function trunc(s, max) {
  if (typeof s !== "string") return null;
  const t = s.trim();
  return t.length > max ? t.slice(0, max) : t;
}

export function sanitizeEvent(raw) {
  const obj = raw && typeof raw === "object" ? raw : null;
  if (!obj) return { ok: false, error: "Body must be JSON object" };

  const event = obj.event;
  const allowed = new Set(["start", "heartbeat", "final"]);
  if (!allowed.has(event)) return { ok: false, error: "Invalid event" };

  const videoId = trunc(obj.videoId, 64);
  const sessionId = trunc(obj.sessionId, 128);

  if (!videoId) return { ok: false, error: "Missing videoId" };
  if (!sessionId) return { ok: false, error: "Missing sessionId" };

  const ts = Number.isFinite(obj.ts) ? obj.ts : Date.now();

  const watchedSeconds =
    Number.isFinite(obj.watchedSeconds) && obj.watchedSeconds >= 0
      ? Math.round(obj.watchedSeconds)
      : (event === "final" ? 0 : null);

  const value = {
    event,
    videoId,
    sessionId,
    ts,

    watchedSeconds,
    currentTime: Number.isFinite(obj.currentTime) && obj.currentTime >= 0 ? obj.currentTime : null,
    playing: typeof obj.playing === "boolean" ? obj.playing : null,
    hidden: typeof obj.hidden === "boolean" ? obj.hidden : null,

    path: trunc(obj.path, 200),
    ref: trunc(obj.ref, 300),
    ua: trunc(obj.ua, 220),

    startedAt: Number.isFinite(obj.startedAt) ? obj.startedAt : null,
    reason: trunc(obj.reason, 60)
  };

  return { ok: true, value };
}
