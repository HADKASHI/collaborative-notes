// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCofs7NqMZM1ZXg0AK6jVOgonSpxoG4ah8",
  authDomain: "collaborative-notes-cc794.firebaseapp.com",
  projectId: "collaborative-notes-cc794",
  storageBucket: "collaborative-notes-cc794.appspot.com",
  messagingSenderId: "335653603636",
  appId: "1:335653603636:web:0fbf4aa136dadf1433bd61",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const firestore = getFirestore(app);

export { auth, firestore };
