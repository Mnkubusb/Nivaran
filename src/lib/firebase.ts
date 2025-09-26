// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB-pfQlWP3WqLhDqkIo2UXSOlPeQI_zgmY",
  authDomain: "studio-6976197092-b4e65.firebaseapp.com",
  projectId: "studio-6976197092-b4e65",
  storageBucket: "studio-6976197092-b4e65.firebasestorage.app",
  messagingSenderId: "465824324091",
  appId: "1:465824324091:web:299db8f339b1f1a7b5d35e"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
