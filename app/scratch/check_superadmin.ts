import "dotenv/config";
import { findUserByUsername } from "../src/api/queries/users";

async function test() {
  console.log("Checking superadmin user...");
  try {
    const user = await findUserByUsername("superadmin");
    if (!user) {
      console.log("User 'superadmin' NOT found.");
    } else {
      console.log("User 'superadmin' found!");
      console.log("ID:", user.id);
      console.log("Role:", user.role);
      console.log("Is Active:", user.isActive);
    }
  } catch (err) {
    console.error("Test failed:", err);
  }
}

test();
