import { useMemo } from 'react'
import useRealtimePoultry from './useRealtimePoultry.js'

// Simple helper to generate stable pseudo-random values from an ID string
function getPseudoValue(id, seed, min, max, decimals = 1) {
  if (!id) return min
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  const factor = Math.abs(hash % 1000) / 1000
  const val = min + factor * (max - min)
  const power = Math.pow(10, decimals)
  return Math.round(val * power) / power
}

/**
 * Health monitor hook that parses poultry data and generates health metrics.
 */
export default function useHealthMonitor() {
  const { records, loading, error, isOffline } = useRealtimePoultry()

  const healthData = useMemo(() => {
    if (!records.length) return { flocks: [], summary: { healthy: 0, warning: 0, critical: 0, overallScore: 100 }, alerts: [] }

    let healthyCount = 0
    let warningCount = 0
    let criticalCount = 0
    const alerts = []

    const flocks = records.map((flock) => {
      // 1. Get/Generate telemetry data (stable per flock ID)
      const temp = flock.temperature ?? getPseudoValue(flock.id, 1, 40.5, 42.4, 1)
      const activity = flock.activityLevel ?? Math.round(getPseudoValue(flock.id, 2, 2, 10, 0))
      const weightDrop = flock.weightChange ?? getPseudoValue(flock.id, 3, -12, 4, 1)
      const feedIntake = flock.feedIntake ?? Math.round(getPseudoValue(flock.id, 4, 75, 120, 0)) // g/bird/day
      const waterIntake = flock.waterIntake ?? Math.round(getPseudoValue(flock.id, 5, 140, 220, 0)) // ml/bird/day
      const vaccination = flock.vaccinationStatus || 'Up to Date'

      // 2. Apply Rule Engine
      const flockAlerts = []
      let flockStatus = 'healthy' // 'healthy' | 'warning' | 'critical'

      // Temperature Fever check
      if (temp > 42.0) {
        flockAlerts.push({
          type: 'critical',
          category: 'Temperature',
          title: 'High Fever Detected',
          detail: `Flock temperature at ${temp}°C exceeds the 41.7°C biosecurity threshold.`,
        })
        flockStatus = 'critical'
      } else if (temp > 41.7) {
        flockAlerts.push({
          type: 'warning',
          category: 'Temperature',
          title: 'Elevated Temperature',
          detail: `Flock temperature is slightly high (${temp}°C). Monitor ventilation.`,
        })
        if (flockStatus !== 'critical') flockStatus = 'warning'
      }

      // Weight decline check
      if (weightDrop <= -10) {
        flockAlerts.push({
          type: 'critical',
          category: 'Growth',
          title: 'Critical Atrophy Warning',
          detail: `Flock average weight declined by ${Math.abs(weightDrop)}% over the last 7 days.`,
        })
        flockStatus = 'critical'
      } else if (weightDrop < -5) {
        flockAlerts.push({
          type: 'warning',
          category: 'Growth',
          title: 'Underweight Growth Drift',
          detail: `Flock average weight declined by ${Math.abs(weightDrop)}%. Check feed nutrition.`,
        })
        if (flockStatus !== 'critical') flockStatus = 'warning'
      }

      // Activity level check
      if (activity <= 3) {
        flockAlerts.push({
          type: 'critical',
          category: 'Activity',
          title: 'Severe Lethargy Detected',
          detail: `Flock activity score is dangerously low (${activity}/10). Suggests active disease.`,
        })
        flockStatus = 'critical'
      } else if (activity <= 5) {
        flockAlerts.push({
          type: 'warning',
          category: 'Activity',
          title: 'Low Activity Indicator',
          detail: `Flock activity is depressed (${activity}/10). Check lighting or air quality.`,
        })
        if (flockStatus !== 'critical') flockStatus = 'warning'
      }

      // Vaccination Schedule check
      if (vaccination === 'Overdue') {
        flockAlerts.push({
          type: 'critical',
          category: 'Vaccination',
          title: 'Biosecurity Schedule Overdue',
          detail: 'Required vaccination window has closed. Immediate dosage needed.',
        })
        flockStatus = 'critical'
      } else if (vaccination === 'Pending') {
        flockAlerts.push({
          type: 'warning',
          category: 'Vaccination',
          title: 'Vaccination Schedule Pending',
          detail: 'Flock has a pending vaccination due within the next 48 hours.',
        })
        if (flockStatus !== 'critical') flockStatus = 'warning'
      }

      // 3. Count statuses
      if (flockStatus === 'critical') criticalCount++
      else if (flockStatus === 'warning') warningCount++
      else healthyCount++

      // 4. Consolidate alerts with metadata
      flockAlerts.forEach((alert) => {
        alerts.push({
          ...alert,
          flockId: flock.id,
          breed: flock.breed,
          timestamp: new Date().toISOString(),
        })
      })

      // Calculate composite flock health score (0-100)
      let score = 100
      if (temp > 42.0) score -= 25
      if (weightDrop < -10) score -= 30
      if (activity <= 3) score -= 25
      if (vaccination === 'Overdue') score -= 20
      if (vaccination === 'Pending') score -= 10
      const flockScore = Math.max(45, score)

      return {
        ...flock,
        telemetry: {
          temp,
          activity,
          weightDrop,
          feedIntake,
          waterIntake,
        },
        healthStatus: flockStatus,
        healthScore: flockScore,
        alerts: flockAlerts,
      }
    })

    const totalFlocks = records.length
    const overallScore = Math.max(
      60,
      Math.round(
        flocks.reduce((sum, f) => sum + f.healthScore, 0) / totalFlocks
      )
    )

    return {
      flocks,
      summary: {
        healthy: healthyCount,
        warning: warningCount,
        critical: criticalCount,
        overallScore,
      },
      alerts,
    }
  }, [records])

  return { ...healthData, loading, error, isOffline }
}
