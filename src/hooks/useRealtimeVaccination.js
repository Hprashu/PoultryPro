import { useMemo } from 'react'
import { orderBy } from 'firebase/firestore'
import useRealtimeCollection from './useRealtimeCollection.js'
import { COLLECTIONS } from '../firebase/firestoreService.js'

/**
 * Realtime vaccination collection hook with schedule summaries.
 */
export default function useRealtimeVaccination() {
  const { data: records, loading, error, isOffline } = useRealtimeCollection(
    COLLECTIONS.vaccination,
    [orderBy('createdAt', 'desc')],
    { fallbackKey: 'poultrypro_vaccination', mockData: [] }
  )

  const summary = useMemo(() => {
    const now = new Date()
    const completed = records.filter((r) => r.status === 'completed' || r.status === 'done')
    const upcoming = records.filter((r) => {
      if (r.status === 'completed' || r.status === 'done') return false
      const date = r.scheduledDate?.toDate ? r.scheduledDate.toDate() : new Date(r.scheduledDate)
      return date >= now
    })
    const overdue = records.filter((r) => {
      if (r.status === 'completed' || r.status === 'done') return false
      const date = r.scheduledDate?.toDate ? r.scheduledDate.toDate() : new Date(r.scheduledDate)
      return date < now
    })

    return {
      completedCount: completed.length,
      upcomingCount: upcoming.length,
      overdueCount: overdue.length,
      upcoming,
      overdue,
      totalRecords: records.length,
    }
  }, [records])

  return { records, summary, loading, error, isOffline }
}
