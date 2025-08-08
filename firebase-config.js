// Twoja konfiguracja z konsoli Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCKCF4Csccas02cPF5ebuQ17dFiFOHMCV8",
  authDomain: "opowiadania-derda.firebaseapp.com",
  projectId: "opowiadania-derda",
  storageBucket: "opowiadania-derda.appspot.com",
  messagingSenderId: "82484134326",
  appId: "1:82484134326:web:8b702517a5619c6ef94117",
  measurementId: "G-HSKHJ6FGR5"
};

// Inicjalizacja Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(); // Inicjalizacja Firestore
