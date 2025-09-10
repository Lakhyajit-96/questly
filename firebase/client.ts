// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCd235xvuOrGk2Oy0gtZF-QqmN9hYS1_Ig",
  authDomain: "questly-4f79f.firebaseapp.com",
  projectId: "questly-4f79f",
  storageBucket: "questly-4f79f.firebasestorage.app",
  messagingSenderId: "758317937488",
  appId: "1:758317937488:web:4b940e9bf24069d2efb255",
  measurementId: "G-Z1WQVKJNQ4"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
// const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
