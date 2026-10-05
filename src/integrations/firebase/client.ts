import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from "../../../firebase-applet-config.json";

// Initialize Firebase App
export const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(firebaseApp);

// Initialize Firestore with specific database ID if provided
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId)
  : getFirestore(firebaseApp);

// Connection test helper
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    const { doc, getDocFromServer } = await import("firebase/firestore");
    await getDocFromServer(doc(db, "_health", "connection"));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("[Firebase] Client is offline or database initializing.");
      return false;
    }
    // Any permission or document-not-found means server responded successfully
    return true;
  }
}

export default firebaseApp;
