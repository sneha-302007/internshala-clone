// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {getAuth, GoogleAuthProvider} from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyANkUdHu_tgdeHssFn3Ozn9PD7eStRJt6I",
  authDomain: "internarea-2dc66.firebaseapp.com",
  projectId: "internarea-2dc66",
  storageBucket: "internarea-2dc66.firebasestorage.app",
  messagingSenderId: "655721751054",
  appId: "1:655721751054:web:390323b12923c6d9cf525f",
  measurementId: "G-84EDNZLNZ5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export {auth,provider};