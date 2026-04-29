// Consolidated API for Vercel (single serverless function)
const users = [
  {
    id: "superadmin",
    username: "superadmin",
    password: "admin123", // Plain text for demo - hash in production
    role: "super_admin",
    fullName: "Super Admin",
    isActive: true,
    isDeleted: false
  }
];

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { pathname } = new URL(req.url, `http://${req.headers.host}`);

  try {
    // Health endpoint
    if (pathname === '/api/health' && req.method === 'GET') {
      res.status(200).json({ ok: true, ts: Date.now() });
      return;
    }

    // Login endpoint
    if (pathname === '/api/login' && req.method === 'POST') {
      const { username, password, expectedRole } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      // Find user (simple array search for demo)
      const user = users.find(u => u.username === username.toLowerCase());

      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      if (!user.isActive || user.isDeleted) {
        return res.status(401).json({ error: "Account is inactive" });
      }

      // Check password (simple comparison for demo)
      if (password !== user.password) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      if (expectedRole && user.role !== expectedRole) {
        return res.status(401).json({ error: "Invalid role for this login page" });
      }

      // Return user data (without password)
      const userData = {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        role: user.role,
        state: user.state,
        assignedPlatoon: user.assignedPlatoon,
        assignedBatchId: user.assignedBatchId,
      };

      res.status(200).json({
        result: {
          data: userData
        }
      });
      return;
    }

    // TRPC endpoints
    if (pathname.startsWith('/api/trpc/')) {
      const procedure = pathname.replace('/api/trpc/', '');

      if (procedure === 'ping' && req.method === 'GET') {
        res.status(200).json({
          result: {
            data: { ok: true, ts: Date.now() }
          }
        });
        return;
      }

      if (procedure === 'customAuth.login' && req.method === 'POST') {
        const { input } = req.body || {};
        if (!input) {
          return res.status(400).json({ error: "Missing input" });
        }

        const { username, password, expectedRole } = input;

        if (!username || !password) {
          return res.status(400).json({ error: "Username and password required" });
        }

        // Find user (simple array search for demo)
        const user = users.find(u => u.username === username.toLowerCase());

        if (!user) {
          return res.status(401).json({ error: "Invalid username or password" });
        }

        if (!user.isActive || user.isDeleted) {
          return res.status(401).json({ error: "Account is inactive" });
        }

        // Check password (simple comparison for demo)
        if (password !== user.password) {
          return res.status(401).json({ error: "Invalid username or password" });
        }

        if (expectedRole && user.role !== expectedRole) {
          return res.status(401).json({ error: "Invalid role for this login page" });
        }

        // Return user data (without password)
        const userData = {
          id: user.id,
          fullName: user.fullName,
          username: user.username,
          role: user.role,
          state: user.state,
          assignedPlatoon: user.assignedPlatoon,
          assignedBatchId: user.assignedBatchId,
        };

        res.status(200).json({
          result: {
            data: userData
          }
        });
        return;
      }
    }

    // Default 404
    res.status(404).json({ error: "Not found" });

  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}