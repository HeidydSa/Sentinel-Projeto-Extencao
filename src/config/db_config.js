// Import the functions you need from the SDKs you need

import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js';
import * as firebase from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  deleteUser,
  sendPasswordResetEmail,
} from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js';

const firebaseConfig = {
  apiKey: 'AIzaSyB3coiGzKFnQTFZYR5MKNF36zzzM4yQbRg',
  authDomain: 'sentinel-5d699.firebaseapp.com',
  projectId: 'sentinel-5d699',
  storageBucket: 'sentinel-5d699.firebasestorage.app',
  messagingSenderId: '1023945980198',
  appId: '1:1023945980198:web:34a036aca16ae855dba9e7',
  measurementId: 'G-RDYLSJ782T',
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

const db = firebase.getFirestore(app);

export {
  db,
  firebase,
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  deleteUser,
  sendPasswordResetEmail,
};
