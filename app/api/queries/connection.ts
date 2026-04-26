import { firestore } from "../lib/firebase-admin";

export function getDb() {
  return firestore;
}
