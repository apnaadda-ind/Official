import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBuHyKMQ62V_1dSNP4fcmMIowVwhlJuIn8",
  authDomain: "apna-adda-company.firebaseapp.com",
  databaseURL: "https://apna-adda-company-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "apna-adda-company",
  storageBucket: "apna-adda-company.firebasestorage.app",
  messagingSenderId: "446756963502",
  appId: "1:446756963502:web:d286ce81aef97fe9ce193f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
