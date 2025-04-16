// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAiiZXA7_TQARmxAPwNoqNHQBKzxMCpwfA",
    authDomain: "firestore-closer.firebaseapp.com",
    projectId: "firestore-closer",
    storageBucket: "firestore-closer.firebasestorage.app",
    messagingSenderId: "194251622592",
    appId: "1:194251622592:web:378ac00f8d51e1d9eb0525",
    measurementId: "G-EERJH61TVZ"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
