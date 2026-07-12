import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCGgImORGqVZXMzkKE6urjF8IIJyiPxwsQ",
  authDomain: "lolo-380f3.firebaseapp.com",
  projectId: "lolo-380f3",
  storageBucket: "lolo-380f3.firebasestorage.app",
  messagingSenderId: "684326123577",
  appId: "1:684326123577:web:55fbe888353081c877b5e8",
  measurementId: "G-6JMKRDM7HY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

export default app;
