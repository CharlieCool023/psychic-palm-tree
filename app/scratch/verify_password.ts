import "dotenv/config";
import { findUserByUsername } from "../src/api/queries/users";
import bcrypt from "bcryptjs";

async function test() {
  console.log("Verifying superadmin password...");
  try {
    const user = await findUserByUsername("superadmin");
    if (!user) {
      console.log("User 'superadmin' NOT found.");
      return;
    }
    
    const isMatch = await bcrypt.compare("admin123", user.password);
    console.log("Password 'admin123' matches?", isMatch);
    
    if (!isMatch) {
      console.log("Stored hash:", user.password);
    }
  } catch (err) {
    console.error("Test failed:", err);
  }
}

test();
