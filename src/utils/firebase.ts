import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyB0DeNmDdYD6dotiiycyp360OEP7T1FguU',
  authDomain: 'worshipflow-ef662.firebaseapp.com',
  projectId: 'worshipflow-ef662',
  storageBucket: 'worshipflow-ef662.firebasestorage.app',
  messagingSenderId: '604562571627',
  appId: '1:604562571627:web:f71ae932fbdbccfdac8c2e',
  measurementId: 'G-R1DER9JE5F'
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache()
});
export const persistencePromise = Promise.resolve();

void isSupported().then((supported) => {
  if (!import.meta.env.PROD) return;
  if (supported) getAnalytics(app);
});
