import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  try {
    console.log("Testing Supabase connection...");

    // Test basic connection
    const { data: health, error: healthError } = await supabase
      .from("users")
      .select("*")
      .limit(1);

    if (healthError) {
      console.error("Connection failed:", healthError);
      return;
    }

    console.log("✅ Supabase connection successful");

    // Check if superadmin exists
    const { data: admin, error: adminError } = await supabase
      .from("users")
      .select("*")
      .eq("username", "superadmin");

    if (adminError) {
      console.error("Superadmin check failed:", adminError);
      return;
    }

    if (admin && admin.length > 0) {
      console.log("✅ Superadmin exists:", {
        id: admin[0].id,
        username: admin[0].username,
        role: admin[0].role,
        isActive: admin[0].is_active
      });
    } else {
      console.log("❌ Superadmin not found, creating...");
      // Create superadmin
      const bcrypt = await import("bcryptjs");
      const hashedPassword = await bcrypt.hash("admin123", 12);
      const { error: createError } = await supabase.from("users").insert({
        id: "superadmin",
        full_name: "Super Admin",
        username: "superadmin",
        password: hashedPassword,
        role: "super_admin",
        is_active: true,
        is_deleted: false,
        created_at: new Date(),
        updated_at: new Date(),
      });
      if (createError) {
        console.error("Failed to create superadmin:", createError);
      } else {
        console.log("✅ Superadmin created successfully");
      }
    }

  } catch (err) {
    console.error("Test failed:", err);
  }
}

testConnection();