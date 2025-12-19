export default async function Dashboard({ searchParams }) {
  const token = searchParams?.token || "";
  const videoId = searchParams?.videoId || "";
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  if (!token || !videoId) {
    return (
      <main style={{ padding: 20 }}>
        <h1>Dashboard</h1>
        <p>Ajoute les query params :</p>
        <pre style={{ background: "#f3f3f3", padding: 12, borderRadius: 8 }}>
{`/dashboard?token=TON_TOKEN&videoId=VUYDppriWjY`}
        </pre>
      </main>
    );
  }

  const url = `${baseUrl}/api/yt-watch/stats?token=${encodeURIComponent(token)}&videoId=${encodeURIComponent(videoId)}`;
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    return (
      <main style={{ padding: 20 }}>
        <h1>Dashboard</h1>
        <p style={{ color: "crimson" }}>Erreur: {res.status}</p>
        <pre style={{ background: "#f3f3f3", padding: 12, borderRadius: 8 }}>{txt}</pre>
      </main>
    );
  }

  const data = await res.json();

  return (
    <main style={{ padding: 20 }}>
      <h1 style={{ marginBottom: 6 }}>Dashboard</h1>
      <div style={{ opacity: 0.8, marginBottom: 14 }}>
        <div><b>VideoId:</b> {data.videoId}</div>
        <div><b>Sessions:</b> {data.count}</div>
        <div><b>Watch time moyen:</b> {data.avgWatchedSeconds}s</div>
      </div>

      <h2 style={{ marginTop: 22 }}>Dernières sessions</h2>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", minWidth: 700 }}>
          <thead>
            <tr>
              <th style={th}>Date</th>
              <th style={th}>Watched (s)</th>
              <th style={th}>Reason</th>
              <th style={th}>Path</th>
              <th style={th}>Ref</th>
            </tr>
          </thead>
          <tbody>
            {(data.lastSessions || []).map((s, i) => (
              <tr key={i}>
                <td style={td}>{s.ts ? new Date(s.ts).toLocaleString("fr-FR") : "-"}</td>
                <td style={td}>{typeof s.watchedSeconds === "number" ? s.watchedSeconds : "-"}</td>
                <td style={td}>{s.reason || "-"}</td>
                <td style={td}>{s.path || "-"}</td>
                <td style={td}>{s.ref || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

const th = { textAlign: "left", borderBottom: "1px solid #ddd", padding: "10px 8px" };
const td = { borderBottom: "1px solid #eee", padding: "10px 8px", verticalAlign: "top" };
