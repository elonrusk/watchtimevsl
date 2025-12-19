export function assertTokenOr401(req) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  const expected = process.env.TRACKING_TOKEN;
  if (!expected) return new Response("Server misconfigured (no TRACKING_TOKEN)", { status: 500 });
  if (!token || token !== expected) return new Response("Unauthorized", { status: 401 });

  return null; // ok
}
