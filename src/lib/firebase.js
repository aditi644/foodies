// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBnKNiH0_f5YRg25be_EP0Y_R8D0T4jXm4",
  authDomain: "dessertin-f1a3e.firebaseapp.com",
  projectId: "dessertin-f1a3e",
  storageBucket: "dessertin-f1a3e.firebasestorage.app",
  messagingSenderId: "459611877988",
  appId: "1:459611877988:web:70c4e4ea69d00ac7056571",
  measurementId: "G-NPT1ZDG1MX"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);