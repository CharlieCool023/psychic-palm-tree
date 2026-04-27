import { firestore } from "../lib/firebase-admin";

export function getDb() {
  return firestore;
}

// Recursively convert Firestore Timestamps to JS Dates
export function fromDoc<T>(data: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === "object" && "toDate" in value && typeof (value as any).toDate === "function") {
      result[key] = (value as any).toDate();
    } else {
      result[key] = value;
    }
  }
  return result as T;
}
