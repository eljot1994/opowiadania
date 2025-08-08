// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCKCF4Csccas02cPF5ebuQ17dFiFOHMCV8",
  authDomain: "opowiadania-derda.firebaseapp.com",
  projectId: "opowiadania-derda",
  storageBucket: "opowiadania-derda.firebasestorage.app",
  messagingSenderId: "82484134326",
  appId: "1:82484134326:web:8b702517a5619c6ef94117",
  measurementId: "G-HSKHJ6FGR5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
