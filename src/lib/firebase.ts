import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDoxW6F17dsghgcgBIQaUU6IJOboIZ_1L0",
  authDomain: "realtime-startup-project.firebaseapp.com",
  projectId: "realtime-startup-project",
  storageBucket: "realtime-startup-project.firebasestorage.app",
  messagingSenderId: "942799010577",
  appId: "1:942799010577:web:6251bceaeef5faadaeaab0",
  measurementId: "G-HP618B0S93",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
