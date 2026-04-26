import * as admin from "firebase-admin";

if (!admin.apps.length) {
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT;

  if (serviceAccountJson) {
    // Running on Render or any non-GCP host — use service account key from env
    const serviceAccount = JSON.parse(serviceAccountJson);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: "nyscondocamp",
    });
  } else {
    // Running on GCP (Cloud Run, Firebase Functions) — use ADC
    admin.initializeApp({ projectId: "nyscondocamp" });
  }
}

if (process.env.NODE_ENV !== "production") {
  process.env.FIRESTORE_EMULATOR_HOST =
    process.env.FIRESTORE_EMULATOR_HOST || "localhost:8080";
}

export const firestore = admin.firestore();
export default admin;
