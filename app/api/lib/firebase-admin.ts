import { createRequire } from "module";
const require = createRequire(import.meta.url);
const admin = require("firebase-admin") as typeof import("firebase-admin");

if (!admin.apps.length) {
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT;
  if (serviceAccountJson) {
    const serviceAccount = JSON.parse(serviceAccountJson);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: "nyscondocamp",
    });
  } else {
    admin.initializeApp({ projectId: "nyscondocamp" });
  }
}

if (process.env.NODE_ENV !== "production") {
  process.env.FIRESTORE_EMULATOR_HOST =
    process.env.FIRESTORE_EMULATOR_HOST || "localhost:8080";
}

export const firestore = admin.firestore();
export default admin;
