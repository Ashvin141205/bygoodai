// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithCredential
} from "firebase/auth";

import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDSvzjWkcM9LzOBQPNsm82oREAZbYqSCLU",
  authDomain: "lucky-charm-sweep.firebaseapp.com",
  projectId: "lucky-charm-sweep",
  storageBucket: "lucky-charm-sweep.firebasestorage.app",
  messagingSenderId: "988486859123",
  appId: "1:988486859123:web:2bcdc2ed6679383d362d06",
  measurementId: "G-Q7WS348D6D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize Firebase Messaging only if supported
let messaging = null;
isSupported().then(supported => {
  if (supported) {
    messaging = getMessaging(app);
  }
});

// New function to register Firebase Messaging Service Worker
const registerFirebaseServiceWorker = () => {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return;
  }

  const serviceWorkerApi = navigator.serviceWorker;
  if (!serviceWorkerApi || typeof serviceWorkerApi.register !== "function" || typeof serviceWorkerApi.addEventListener !== "function") {
    return;
  }

  serviceWorkerApi
      .register('/firebase-messaging-sw.js')
      .then((registration) => {
        console.log('Firebase Service Worker registered with scope: ', registration.scope);
      })
      .catch((err) => {
        console.error('Firebase Service Worker registration failed: ', err);
      });
};

export {
  auth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithCredential,
  messaging,
  registerFirebaseServiceWorker // <-- Export the new function
};