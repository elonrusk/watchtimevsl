import { kv } from "@vercel/kv";
import { assertTokenOr401 } from "../../../../lib/auth.js";
import { keysForVideo } from "../../../../lib/kvKeys.js";

export async function GET(req) {
  const auth = assertTokenOr401(req);
  if (auth) return auth;

  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get("videoId");

  if (!videoId) return new Response("Missing videoId", { status: 400 });

  const keys = keysForVideo(videoId);
  const items = await kv.lrange(keys.finals, 0, 199); // dernières 200 sessions

  const sessions = items
    .map((x) => {
      try { return JSON.parse(x); } catch { return null; }
    })
    .filter(Boolean)
    .filter((s) => typeof s.watchedSeconds === "number" && s.watchedSeconds >= 0);

  const count = sessions.length;
  const sum = sessions.reduce((a, s) => a + s.watchedSeconds, 0);
  const avg = count ? sum / count : 0;

  return Response.json({
    videoId,
    count,
    avgWatchedSeconds: Math.round(avg),
    lastSessions: sessions.slice(0, 50)
  });
}
