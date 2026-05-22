import { useMemo } from 'react'
import { orderBy } from 'firebase/firestore'
import useRealtimeCollection from './useRealtimeCollection.js'
import { COLLECTIONS } from '../firebase/firestoreService.js'

/**
 * Realtime alerts collection hook with severity grouping.
 */
export default function useRealtimeAlerts() {
  const { data: alerts, loading, error, isOffline } = useRealtimeCollection(
    COLLECTIONS.alerts,
    [orderBy('createdAt', 'desc')],
    { fallbackKey: 'poultrypro_alerts', mockData: [] }
  )

  const grouped = useMemo(() => {
    const critical = alerts.filter((a) => a.severity === 'critical')
    const warning = alerts.filter((a) => a.severity === 'warning' || a.severity === 'medium')
    const info = alerts.filter((a) => a.severity === 'info' || a.severity === 'low')
    const unread = alerts.filter((a) => !a.read)

    return {
      critical,
      warning,
      info,
      unreadCount: unread.length,
      totalCount: alerts.length,
    }
  }, [alerts])

  return { alerts, grouped, loading, error, isOffline }
}
