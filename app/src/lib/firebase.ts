import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "nyscondocamp.firebaseapp.com",
  projectId: "nyscondocamp",
  storageBucket: "nyscondocamp.firebasestorage.app",
  messagingSenderId: "999918081641",
  appId: "1:999918081641:web:83e7dce239d69fab1134f8",
  measurementId: "G-2CJDGDJ84D",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

if (import.meta.env.DEV) {
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFirestoreEmulator(db, "localhost", 8080);
}

export default app;
