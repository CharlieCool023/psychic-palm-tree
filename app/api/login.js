import "dotenv/config";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { username, password, expectedRole } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    // Find user
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username.toLowerCase())
      .single();

    if (error || !user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    if (!user.is_active || user.is_deleted) {
      return res.status(401).json({ error: "Account is inactive" });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    if (expectedRole && user.role !== expectedRole) {
      return res.status(401).json({ error: "Invalid role for this login page" });
    }

    // Update last sign in
    await supabase
      .from("users")
      .update({ last_sign_in_at: new Date() })
      .eq("id", user.id);

    // Return user data (without password)
    const userData = {
      id: user.id,
      fullName: user.full_name,
      username: user.username,
      role: user.role,
      state: user.state,
      assignedPlatoon: user.assigned_platoon,
      assignedBatchId: user.assigned_batch_id,
    };

    res.status(200).json({ result: { data: userData } });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}