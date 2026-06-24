import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Firebase console'dan aldığın config'i buraya yapıştır
const firebaseConfig = {
  apiKey: "AIzaSyBKJVo4cH2xAT9D2atYX0efNMGRyXXW4u8",
  authDomain: "ikc-store.firebaseapp.com",
  projectId: "ikc-store",
  storageBucket: "ikc-store.firebasestorage.app",
  messagingSenderId: "508538629679",
  appId: "1:508538629679:web:2fcb60b389fd822e4b60da",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
