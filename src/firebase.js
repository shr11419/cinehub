// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {    
  apiKey: "AIzaSyBMpLTBTzuq9GrNUKckquITsmIeY_KdAQQ",
  authDomain: "cinehub-e901a.firebaseapp.com",
  projectId: "cinehub-e901a",
  storageBucket: "cinehub-e901a.firebasestorage.app",
  messagingSenderId: "475708675296",
  appId: "1:475708675296:web:c095f5656c4a9e4b906c85",
  measurementId: "G-PXNWZYR446",
  databaseURL: "https://cinehub-e901a-default-rtdb.firebaseio.com/",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
export const db = getDatabase(app);