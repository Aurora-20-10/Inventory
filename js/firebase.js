import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

// TODO: Replace with your Firebase project configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function loadData(uid) {
  return getDoc(doc(db, 'inventory', uid)).then(snap => {
    if (snap.exists()) {
      window.data = Array.isArray(snap.data().items) ? [...snap.data().items] : [];
    } else {
      window.data = [];
    }
  });
}

function saveData(uid, items) {
  return setDoc(doc(db, 'inventory', uid), { items });
}

export function initAuth() {
  const signInBtn = document.getElementById('signInBtn');
  const signOutBtn = document.getElementById('signOutBtn');
  const userLabel = document.getElementById('userLabel');

  signInBtn.addEventListener('click', () => {
    signInWithPopup(auth, new GoogleAuthProvider());
  });

  signOutBtn.addEventListener('click', () => {
    signOut(auth);
  });

  onAuthStateChanged(auth, user => {
    if (user) {
      userLabel.textContent = user.email;
      signInBtn.style.display = 'none';
      signOutBtn.style.display = '';
      loadData(user.uid).then(() => {
        if (typeof initFilters === 'function') {
          initFilters();
          renderTable(window.data);
        }
      });
    } else {
      userLabel.textContent = 'Chưa đăng nhập';
      signInBtn.style.display = '';
      signOutBtn.style.display = 'none';
      window.data = JSON.parse(localStorage.getItem('inventoryData') || '[]');
      if (typeof initFilters === 'function') {
        initFilters();
        renderTable(window.data);
      }
    }
  });
}

window.saveToFirestore = function() {
  const user = auth.currentUser;
  if (user) {
    saveData(user.uid, window.data);
  }
};

if (typeof window !== 'undefined') {
  initAuth();
}
