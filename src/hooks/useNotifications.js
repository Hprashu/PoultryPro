import { useEffect, useRef } from 'react'
import { useNotifications as useNotificationCtx } from '../contexts/NotificationContext.jsx'
import useHealthMonitor from './useHealthMonitor.js'

/**
 * Hook to access notifications and automatically trigger system alerts based on telemetry.
 */
export default function useNotifications() {
  const context = useNotificationCtx()
  const { alerts } = useHealthMonitor()
  const processedAlertsRef = useRef(new Set())

  // Load processed alert keys from localStorage to prevent duplicate notifications across reloads
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('poultrypro_notified_alerts')
      if (stored) {
        const keys = JSON.parse(stored)
        processedAlertsRef.current = new Set(keys)
      }
    } catch (e) {
      console.error('Failed to load notified alerts cache', e)
    }
  }, [])

  // Auto-generate notifications from health alerts
  useEffect(() => {
    if (!alerts || alerts.length === 0) return

    let updated = false
    alerts.forEach((alert) => {
      if (!alert) return
      const flockId = alert.flockId || 'unknown'
      const category = alert.category || 'general'
      const title = alert.title || 'alert'
      const alertKey = `${flockId}_${category}_${title}`
      
      if (!processedAlertsRef.current.has(alertKey)) {
        processedAlertsRef.current.add(alertKey)
        updated = true

        const flockShort = String(flockId).slice(-4).toUpperCase()
        const breed = alert.breed || 'Unknown'
        const detail = alert.detail || ''
        const type = alert.type || 'warning'

        // Map health alert to system notification
        context.addNotification({
          title: `Health Alert: ${title}`,
          detail: `Flock #${flockShort} (${breed}): ${detail}`,
          type: type, // 'critical' | 'warning'
          category: 'Health',
        })
      }
    })

    if (updated) {
      try {
        window.localStorage.setItem(
          'poultrypro_notified_alerts',
          JSON.stringify(Array.from(processedAlertsRef.current))
        )
      } catch (e) {
        console.error('Failed to save notified alerts cache', e)
      }
    }
  }, [alerts, context])


  return context
}
