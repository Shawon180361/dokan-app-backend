// config/firebase.js
import admin from "firebase-admin";

let firebaseApp;

try {
  if (!admin.apps.length) {
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT,
      universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
    };

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("✅ Firebase Admin initialized");
  }
} catch (error) {
  console.error("❌ Firebase initialization error:", error.message);
}

export default admin;