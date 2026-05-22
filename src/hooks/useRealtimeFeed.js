import { useMemo } from 'react'
import { orderBy } from 'firebase/firestore'
import useRealtimeCollection from './useRealtimeCollection.js'
import { COLLECTIONS } from '../firebase/firestoreService.js'

/**
 * Realtime feed collection hook with computed summaries.
 */
export default function useRealtimeFeed() {
  const { data: records, loading, error, isOffline } = useRealtimeCollection(
    COLLECTIONS.feed,
    [orderBy('createdAt', 'desc')],
    { fallbackKey: 'poultrypro_feed', mockData: [] }
  )

  const summary = useMemo(() => {
    const totalStock = records.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0)
    const totalCost = records.reduce((sum, r) => sum + (Number(r.cost) || 0), 0)
    const lowStockItems = records.filter((r) => (Number(r.quantity) || 0) < (Number(r.minStock) || 50))
    const feedTypes = [...new Set(records.map((r) => r.feedType).filter(Boolean))]

    return {
      totalStock,
      totalCost,
      lowStockCount: lowStockItems.length,
      lowStockItems,
      feedTypes,
      totalRecords: records.length,
    }
  }, [records])

  return { records, summary, loading, error, isOffline }
}
