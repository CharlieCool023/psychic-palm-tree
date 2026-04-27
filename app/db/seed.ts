/**
 * Production seed — uses Firestore REST API with the project API key.
 * No service account or gcloud ADC needed.
 */
import bcrypt from "bcryptjs";

const PROJECT_ID = "nyscondocamp";
const API_KEY = process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || "";
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

async function firestoreGet(path: string) {
  const res = await fetch(`${BASE}/${path}?key=${API_KEY}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GET ${path} failed: ${await res.text()}`);
  return res.json();
}

async function firestoreSet(path: string, fields: Record<string, unknown>) {
  const body = { fields: toFirestoreFields(fields) };
  const res = await fetch(`${BASE}/${path}?key=${API_KEY}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`SET ${path} failed: ${await res.text()}`);
  return res.json();
}

async function firestoreAdd(collection: string, fields: Record<string, unknown>) {
  const body = { fields: toFirestoreFields(fields) };
  const res = await fetch(`${BASE}/${collection}?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`ADD ${collection} failed: ${await res.text()}`);
  return res.json();
}

async function firestoreQuery(collection: string, field: string, value: unknown) {
  const body = {
    structuredQuery: {
      from: [{ collectionId: collection }],
      where: {
        fieldFilter: {
          field: { fieldPath: field },
          op: "EQUAL",
          value: toFirestoreValue(value),
        },
      },
      limit: 1,
    },
  };
  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery?key=${API_KEY}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
  );
  if (!res.ok) throw new Error(`QUERY ${collection} failed: ${await res.text()}`);
  const results = await res.json() as any[];
  return results[0]?.document ?? null;
}

function toFirestoreValue(value: unknown): unknown {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "number") return { integerValue: String(value) };
  if (typeof value === "boolean") return { booleanValue: value };
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (typeof value === "object") {
    return { mapValue: { fields: toFirestoreFields(value as Record<string, unknown>) } };
  }
  return { stringValue: String(value) };
}

function toFirestoreFields(obj: Record<string, unknown>): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    fields[k] = toFirestoreValue(v);
  }
  return fields;
}

async function seed() {
  // Seed super admin
  const existingAdmin = await firestoreGet("users/superadmin");
  if (existingAdmin) {
    console.log("Super admin already exists — skipping.");
  } else {
    const hashedPassword = await bcrypt.hash("admin123", 12);
    await firestoreSet("users/superadmin", {
      id: "superadmin",
      fullName: "Super Admin",
      username: "superadmin",
      password: hashedPassword,
      role: "super_admin",
      isActive: true,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("✓ Super admin created  →  username: superadmin  |  password: admin123");
  }

  // Seed initial batch
  const existingBatch = await firestoreQuery("batches", "name", "Batch A 2025");
  if (existingBatch) {
    console.log("Batch already exists — skipping.");
  } else {
    const result = await firestoreAdd("batches", {
      name: "Batch A 2025",
      year: 2025,
      state: "ondo",
      description: "First batch of 2025 orientation camp",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }) as any;
    const id = result.name?.split("/").pop();
    console.log("✓ Batch A 2025 created  →  id:", id);
  }

  console.log("\nDone. You can now log in at https://nyscondocamp.web.app");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
