import { useEffect, useState, useRef } from 'react'
import { subscribeToCollection } from '../firebase/realtimeService.js'

const FALLBACK_KEY_PREFIX = 'poultrypro_'

/**
 * Generic realtime Firestore collection hook.
 *
 * @param {string} collectionName
 * @param {Array} constraints — Firestore query constraints (orderBy, where, etc.)
 * @param {Object} options
 * @param {string} options.fallbackKey — localStorage key for offline fallback
 * @param {Array}  options.mockData — mock data if nothing in localStorage
 * @returns {{ data: Array, loading: boolean, error: string|null, isOffline: boolean }}
 */
export default function useRealtimeCollection(collectionName, constraints = [], options = {}) {
  const {
    fallbackKey = `${FALLBACK_KEY_PREFIX}${collectionName}`,
    mockData = [],
  } = options

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isOffline, setIsOffline] = useState(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    function getFallback() {
      try {
        const cached = window.localStorage.getItem(fallbackKey)
        if (cached) return JSON.parse(cached)
      } catch { /* ignore */ }
      return mockData
    }

    function cacheData(docs) {
      try {
        window.localStorage.setItem(fallbackKey, JSON.stringify(docs))
      } catch { /* ignore */ }
    }

    const unsubscribe = subscribeToCollection(
      collectionName,
      constraints,
      (docs) => {
        if (!mountedRef.current) return
        setData(docs)
        setError(null)
        setIsOffline(false)
        setLoading(false)
        cacheData(docs)
      },
      (err) => {
        if (!mountedRef.current) return
        if (err.code === 'permission-denied') {
          const fallback = getFallback()
          setData(fallback)
          setIsOffline(true)
          setError(null)
          console.warn(`[useRealtimeCollection] ${collectionName}: permission-denied, using fallback (${fallback.length} docs)`)
        } else {
          setError(`Failed to load ${collectionName}: ${err.message}`)
        }
        setLoading(false)
      }
    )

    return () => {
      mountedRef.current = false
      unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName])

  return { data, setData, loading, error, isOffline }
}
