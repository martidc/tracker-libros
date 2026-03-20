import { initializeApp }                from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore }                 from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, GoogleAuthProvider,
         signInWithPopup, signOut,
         onAuthStateChanged }           from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey:            "AIzaSyBIcKDmJaBMixGkKEcVEfdqzjRa2gVK5ls",
  authDomain:        "tracker-libros.firebaseapp.com",
  projectId:         "tracker-libros",
  storageBucket:     "tracker-libros.firebasestorage.app",
  messagingSenderId: "534343030046",
  appId:             "1:534343030046:web:af8cb89ad76ef42d82a50f"
};

const app      = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export function loginWithGoogle() {
  return signInWithPopup(auth, provider);
}

export function logout() {
  return signOut(auth);
}

export function onAuthChanged(callback) {
  return onAuthStateChanged(auth, callback);
}