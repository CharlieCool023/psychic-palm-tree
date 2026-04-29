/**
 * Production seed — uses Supabase client.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  // Seed super admin
  const { data: existingAdmin } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("username", "superadmin")
    .single();

  if (existingAdmin) {
    console.log("Super admin already exists — skipping.");
  } else {
    const hashedPassword = await bcrypt.hash("admin123", 12);
    const { error } = await supabaseAdmin.from("users").insert({
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
    if (error) throw error;
    console.log("✓ Super admin created  →  username: superadmin  |  password: admin123");
  }

  // Seed initial batch
  const { data: existingBatch } = await supabaseAdmin
    .from("batches")
    .select("*")
    .eq("name", "Batch A 2025")
    .single();

  if (existingBatch) {
    console.log("Batch already exists — skipping.");
  } else {
    const { data, error } = await supabaseAdmin
      .from("batches")
      .insert({
        id: "batch-a-2025",
        name: "Batch A 2025",
        year: 2025,
        state: "ondo",
        description: "First batch of 2025 orientation camp",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .select()
      .single();
    if (error) throw error;
    console.log("✓ Batch A 2025 created  →  id:", data.id);
  }

  console.log("\nDone. You can now log in at https://nyscondocamp.web.app");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
