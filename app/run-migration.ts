import "dotenv/config";
import { Client } from "pg";
import fs from "fs";

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  try {
    await client.connect();
    console.log("Connected to database");

    const sql = fs.readFileSync("db/migrations/0000_handy_brother_voodoo.sql", "utf8");
    console.log("Running migration SQL...");

    await client.query(sql);
    console.log("Migration completed successfully");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

runMigration();