// config/firebase.js
import admin from "firebase-admin";

let firebaseApp;

try {
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("✅ Firebase Admin initialized");
  }
} catch (error) {
  console.error("❌ Firebase error:", error.message);
}

export default admin;