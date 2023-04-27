import firebase from "firebase";
import "firebase/auth";
import "firebase/analytics";
const config = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "mugstory-2febb.firebaseapp.com",
  projectId: "mugstory-2febb",
  storageBucket: "mugstory-2febb.appspot.com",
  messagingSenderId: "740841772157",
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};
if (!firebase.apps.length) {
  firebase.initializeApp(config);
}
const auth = firebase.auth();
const firestore = firebase.firestore(firebase.app());
export { auth, firebase, firestore };
