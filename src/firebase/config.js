// Firebase core configuration — single source of truth
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyC9uR0QkVmv_lHeSygjxbvKV_qJKB_c2Uk",
  authDomain: "smartpoultryai.firebaseapp.com",
  projectId: "smartpoultryai",
  storageBucket: "smartpoultryai.firebasestorage.app",
  messagingSenderId: "319651588674",
  appId: "1:319651588674:web:b508167721564d8fd8dbdb"
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const googleProvider = new GoogleAuthProvider()

console.log('[Firebase] Initialized — project:', firebaseConfig.projectId)
