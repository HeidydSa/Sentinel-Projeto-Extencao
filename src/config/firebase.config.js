// Import the functions you need from the SDKs you need

import { initializeApp } from 'firebase/app';
// import { getAnalytics } from 'firebase/analytics';

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: 'AIzaSyB3coiGzKFnQTFZYR5MKNF36zzzM4yQbRg',
  authDomain: 'sentinel-5d699.firebaseapp.com',
  projectId: 'sentinel-5d699',
  storageBucket: 'sentinel-5d699.firebasestorage.app',
  messagingSenderId: '1023945980198',
  appId: '1:1023945980198:web:34a036aca16ae855dba9e7',
  measurementId: 'G-RDYLSJ782T',
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);

// const analytics = getAnalytics(app);

export default app;
