// require() is provided by the esbuild banner at bundle top-level
declare const require: NodeRequire;
const admin = require("firebase-admin") as typeof import("firebase-admin");

if (!admin.apps.length) {
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT;
  if (serviceAccountJson) {
    try {
      const serviceAccount = JSON.parse(serviceAccountJson);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id || "nyscondocamp",
      });
    } catch (e) {
      console.warn("Failed to parse service account, using default:", e);
      admin.initializeApp({
        projectId: "nyscondocamp",
      });
    }
  } else {
    admin.initializeApp({
      projectId: "nyscondocamp",
    });
  }
}

if (process.env.NODE_ENV !== "production") {
  process.env.FIRESTORE_EMULATOR_HOST =
    process.env.FIRESTORE_EMULATOR_HOST || "localhost:8080";
}

export const firestore = admin.firestore();
export default admin;
