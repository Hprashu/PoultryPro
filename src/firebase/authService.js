// Authentication service — re-exports all auth utilities
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
} from 'firebase/auth'

export { auth, googleProvider } from './config.js'
