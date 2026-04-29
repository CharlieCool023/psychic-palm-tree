// Simple API for Vercel
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // Health endpoint
  if (pathname === '/api/health' && req.method === 'GET') {
    res.status(200).json({ ok: true, ts: Date.now() });
    return;
  }

  // TRPC customAuth.login endpoint
  if (pathname === '/api/trpc/customAuth.login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const { input } = JSON.parse(body);
        const { username, password, expectedRole } = input;

        if (!username || !password) {
          return res.status(400).json({ error: "Username and password required" });
        }

        // Simple hardcoded user for demo
        if (username === 'superadmin' && password === 'admin123') {
          if (expectedRole && expectedRole !== 'super_admin') {
            return res.status(401).json({ error: "Invalid role for this login page" });
          }

          const userData = {
            id: "superadmin",
            fullName: "Super Admin",
            username: "superadmin",
            role: "super_admin",
            state: null,
            assignedPlatoon: null,
            assignedBatchId: null,
          };

          res.status(200).json({
            result: {
              data: userData
            }
          });
        } else {
          res.status(401).json({ error: "Invalid username or password" });
        }
      } catch (error) {
        res.status(400).json({ error: "Invalid JSON" });
      }
    });
    return;
  }

  // Ping endpoint
  if (pathname === '/api/trpc/ping' && req.method === 'GET') {
    res.status(200).json({
      result: {
        data: { ok: true, ts: Date.now() }
      }
    });
    return;
  }

  // Default 404
  res.status(404).json({ error: "Not found" });
}