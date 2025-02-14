import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAvj2bzF2-Yi_8wAGDUncgCGuNgqiHP6hQ",
  authDomain: "faithfusion-32e92.firebaseapp.com",
  databaseURL: "https://faithfusion-32e92-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "faithfusion-32e92",
  storageBucket: "faithfusion-32e92.firebasestorage.app",
  messagingSenderId: "934145693862",
  appId: "1:934145693862:web:83643b5ec957323ac63c67",
  measurementId: "G-JCXJ3PCZFF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;
