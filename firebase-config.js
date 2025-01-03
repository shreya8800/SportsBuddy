// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword,signInWithEmailAndPassword,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC_VpQw6clAw2kAOg8x4gyJAN9hCw_OrRI",
  authDomain: "sportsbuddy-65286.firebaseapp.com",
  projectId: "sportsbuddy-65286",
  storageBucket: "sportsbuddy-65286.firebasestorage.app",
  messagingSenderId: "511513057829",
  appId: "1:511513057829:web:f02d6caea051fd08b37dcc",
  measurementId: "G-DERPRN6PNN",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
