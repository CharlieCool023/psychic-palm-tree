const http = require('http');
const url = require('url');

const users = [
  {
    id: "superadmin",
    username: "superadmin",
    password: "admin123",
    role: "super_admin",
    fullName: "Super Admin",
    isActive: true,
    isDeleted: false
  }
];

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Health endpoint
  if (pathname === '/api/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, ts: Date.now() }));
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
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: "Username and password required" }));
          return;
        }

        // Find user
        const user = users.find(u => u.username === username.toLowerCase());

        if (!user || password !== user.password) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: "Invalid username or password" }));
          return;
        }

        if (!user.isActive || user.isDeleted) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: "Account is inactive" }));
          return;
        }

        if (expectedRole && user.role !== expectedRole) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: "Invalid role for this login page" }));
          return;
        }

        // Return user data
        const userData = {
          id: user.id,
          fullName: user.fullName,
          username: user.username,
          role: user.role,
          state: user.state,
          assignedPlatoon: user.assignedPlatoon,
          assignedBatchId: user.assignedBatchId,
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          result: {
            data: userData
          }
        }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "Invalid request" }));
      }
    });
    return;
  }

  // Ping endpoint
  if (pathname === '/api/trpc/ping' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      result: {
        data: { ok: true, ts: Date.now() }
      }
    }));
    return;
  }

  // Default 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: "Not found" }));
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log('Test login at: https://nyscondocamp.web.app/login/super_admin');
  console.log('Credentials: superadmin / admin123');
});