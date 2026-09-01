const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
if (typeof process.loadEnvFile === "function") {
  try { process.loadEnvFile(path.join(root, "..", ".env")); } catch {}
}
const port = Number(process.env.PORT) || 8788;
const supabaseUrl = (process.env.SUPABASE_URL || "").replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const tableUrl = `${supabaseUrl}/rest/v1/todo_pomodoro_state`;
const fallback = { tasks: [], focusId: null, rounds: 0, mode: "work", workMinutes: 25, breakMinutes: 5, timerRunning: false, timerEndAt: null, timerSecondsLeft: null, updatedAt: 0 };

function configured() {
  return Boolean(supabaseUrl && supabaseKey);
}

async function readState() {
  if (!configured()) throw new Error("Supabase is not configured");
  const response = await fetch(`${tableUrl}?id=eq.1&select=state` , {
    headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }
  });
  if (!response.ok) throw new Error(`Supabase GET failed: ${response.status}`);
  const rows = await response.json();
  return rows[0]?.state || fallback;
}

async function writeState(state) {
  if (!configured()) throw new Error("Supabase is not configured");
  const response = await fetch(tableUrl, {
    method: "POST",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation"
    },
    body: JSON.stringify({ id: 1, state, updated_at: new Date().toISOString() })
  });
  if (!response.ok) throw new Error(`Supabase POST failed: ${response.status}`);
  const rows = await response.json();
  return rows[0]?.state || state;
}

function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(body);
}

http.createServer(async (req, res) => {
  if (req.url === "/api/state" && req.method === "GET") {
    try { send(res, 200, JSON.stringify(await readState())); }
    catch (error) { send(res, 503, JSON.stringify({ error: error.message })); }
    return;
  }

  if (req.url === "/api/state" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; if (body.length > 200000) req.destroy(); });
    req.on("end", async () => {
      try {
        const incoming = JSON.parse(body || "{}");
        const current = await readState();
        const saved = (incoming.updatedAt || 0) >= (current.updatedAt || 0)
          ? await writeState(incoming)
          : current;
        send(res, 200, JSON.stringify(saved));
      } catch (error) {
        send(res, error.message === "Supabase is not configured" ? 503 : 400, JSON.stringify({ error: error.message }));
      }
    });
    return;
  }

  const filePath = path.join(root, req.url === "/" ? "todo-pomodoro.html" : decodeURIComponent(req.url.slice(1)));
  if (!filePath.startsWith(root) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    send(res, 404, "Not found", "text/plain; charset=utf-8");
    return;
  }
  send(res, 200, fs.readFileSync(filePath), filePath.endsWith(".html") ? "text/html; charset=utf-8" : "application/octet-stream");
}).listen(port, process.env.HOST || "0.0.0.0", () => {
  console.log(`http://localhost:${port}/todo-pomodoro.html`);
});
