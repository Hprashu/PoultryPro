// Firebase barrel export — backward-compatible with old firebase.js imports
// All consumers can: import { auth, db, ... } from '../firebase'

export { app, auth, db, storage, googleProvider } from './config.js'

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged,
} from './authService.js'

export {
  COLLECTIONS,
  addDocument,
  updateDocument,
  deleteDocument,
  getDocuments,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  where,
  limit,
  Timestamp,
} from './firestoreService.js'

export {
  subscribeToCollection,
  onSnapshot,
} from './realtimeService.js'

export {
  uploadImage,
  deleteImage,
} from './storageService.js'
