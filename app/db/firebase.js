import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA5hJkZanpfRlsfx9NJdDO8g6oBgRZ0pTk",
  authDomain: "todo-with-copilot.firebaseapp.com",
  projectId: "todo-with-copilot",
  storageBucket: "todo-with-copilot.firebasestorage.app",
  messagingSenderId: "217603509059",
  appId: "1:217603509059:web:f0765a7ab9d66211eb3df6",
  measurementId: "G-PCJNNRM2ZK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
import { getFirestore } from "firebase/firestore";

const db = getFirestore(app);

export { db };