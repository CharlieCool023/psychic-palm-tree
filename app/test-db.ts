import "dotenv/config";
import { supabase } from "./api/lib/supabase.js";

async function testConnection() {
  try {
    const { data, error } = await supabase.from("users").select("*").limit(1);
    if (error) {
      console.log("Connection OK, but table not found:", error.message);
    } else {
      console.log("Connection OK, data:", data);
    }
  } catch (err) {
    console.error("Connection failed:", err);
  }
}

testConnection();