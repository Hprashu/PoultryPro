// Realtime subscription service
import { collection, onSnapshot, query } from 'firebase/firestore'
import { db } from './config.js'

/**
 * Subscribe to a Firestore collection with realtime updates.
 *
 * @param {string} collectionName — Firestore collection path
 * @param {Array} constraints — query constraints (orderBy, where, limit, etc.)
 * @param {Function} onData — called with array of documents on every snapshot
 * @param {Function} onError — called on subscription error
 * @returns {Function} unsubscribe function
 */
export function subscribeToCollection(collectionName, constraints = [], onData, onError) {
  const q = query(collection(db, collectionName), ...constraints)

  console.log(`[Realtime] Subscribing to "${collectionName}" with ${constraints.length} constraint(s)`)

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      console.log(`[Realtime] ${collectionName} snapshot — ${docs.length} doc(s)`)
      onData(docs)
    },
    (error) => {
      console.error(`[Realtime] ${collectionName} error:`, error.code, error.message)
      if (onError) onError(error)
    }
  )

  return unsubscribe
}

/* Re-export onSnapshot for direct use when needed */
export { onSnapshot } from 'firebase/firestore'
