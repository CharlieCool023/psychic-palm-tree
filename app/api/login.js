// Simple login API for Vercel - hardcoded for demo
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

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
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

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}