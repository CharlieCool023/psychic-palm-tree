import "dotenv/config";
import { getDb } from "../src/api/queries/connection";

async function test() {
  console.log("Testing DB connection...");
  console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
  
  try {
    const db = getDb();
    const { data, error } = await db.from("users").select("count").limit(1);
    
    if (error) {
      console.error("Query error:", error.message);
    } else {
      console.log("Connection successful! User count query worked.");
      console.log("Data:", data);
    }
  } catch (err) {
    console.error("Test crashed:", err);
  }
}

test();
