export function keysForVideo(videoId) {
  const vid = String(videoId).trim();
  return {
    finals: `yt:final:${vid}`,
    events: `yt:events:${vid}`
  };
}
