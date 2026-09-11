// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, doc, getDoc, setDoc, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAmgE2DlqVOVwmOec9NHKi6THFpX4rjdUs",
  authDomain: "draft-room-df695.firebaseapp.com",
  projectId: "draft-room-df6955",
  storageBucket: "draft-room-df695.appspot.com",
  messagingSenderId: "374851947222",
  appId: "1:374851947222:web:85e1eb133f2af800205777"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);
const COLLECTION = "draftapp";

window.storage = {
  async get(key) {
    const snap = await getDoc(doc(db, COLLECTION, key));
    if (!snap.exists()) return null;
    return { value: snap.data().value };
  },
  async set(key, value) {
    await setDoc(doc(db, COLLECTION, key), { value, updatedAt: Date.now() });
    return { value };
  }
};

window.storageRealtime = {
  subscribe(key, cb) {
    return onSnapshot(doc(db, COLLECTION, key), (snap) => {
      if (!snap.exists()) { cb(null); return; }
      cb({ value: snap.data().value });
    });
  }
};

window.dispatchEvent(new Event('firebase-ready'));