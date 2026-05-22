// Firestore service — generic CRUD helpers + collection constants
import {
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
} from 'firebase/firestore'
import { db } from './config.js'

/* ─── Collection names (single source of truth) ─── */
export const COLLECTIONS = {
  poultry: 'poultry',
  feed: 'feed',
  vaccination: 'vaccination',
  alerts: 'alerts',
  notifications: 'notifications',
  expenses: 'expenses',
  revenue: 'revenue',
  images: 'images',
  healthLogs: 'healthLogs',
  userPreferences: 'userPreferences',
  voiceHistory: 'voiceHistory',
  chatSessions: 'chatSessions',
  chatHistory: 'chatHistory',
}

/* ─── Generic CRUD helpers ─── */

export async function addDocument(collectionName, data, userId) {
  const payload = {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  if (userId) payload.userId = userId

  const ref = await addDoc(collection(db, collectionName), payload)
  console.log(`[Firestore] Added doc to ${collectionName}:`, ref.id)
  return ref
}

export async function updateDocument(collectionName, docId, data) {
  const ref = doc(db, collectionName, docId)
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  })
  console.log(`[Firestore] Updated ${collectionName}/${docId}`)
}

export async function deleteDocument(collectionName, docId) {
  const ref = doc(db, collectionName, docId)
  await deleteDoc(ref)
  console.log(`[Firestore] Deleted ${collectionName}/${docId}`)
}

export async function getDocuments(collectionName, constraints = []) {
  const q = query(collection(db, collectionName), ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

/* ─── Re-exports for convenience ─── */
export {
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
} from 'firebase/firestore'

export { db } from './config.js'
