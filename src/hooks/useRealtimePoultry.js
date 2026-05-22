import { useMemo } from 'react'
import { orderBy } from 'firebase/firestore'
import useRealtimeCollection from './useRealtimeCollection.js'
import { COLLECTIONS } from '../firebase/firestoreService.js'

const MOCK_POULTRY = [
  { id: 'mock-1', breed: 'Leghorn', birdCount: 250, birdAge: 45, birdWeight: 1.8, feedType: 'Layer Mash', vaccinationStatus: 'Up to Date' },
  { id: 'mock-2', breed: 'Broiler', birdCount: 500, birdAge: 28, birdWeight: 2.1, feedType: 'Finisher', vaccinationStatus: 'Pending' },
  { id: 'mock-3', breed: 'Layer', birdCount: 300, birdAge: 60, birdWeight: 1.9, feedType: 'Layer Mash', vaccinationStatus: 'Up to Date' },
  { id: 'mock-4', breed: 'Rhode Island Red', birdCount: 150, birdAge: 15, birdWeight: 0.6, feedType: 'Starter', vaccinationStatus: 'Overdue' },
]

/**
 * Realtime poultry collection hook with computed summaries.
 */
export default function useRealtimePoultry() {
  const { data: records, setData, loading, error, isOffline } = useRealtimeCollection(
    COLLECTIONS.poultry,
    [orderBy('createdAt', 'desc')],
    { fallbackKey: 'poultry_records', mockData: MOCK_POULTRY }
  )

  const summary = useMemo(() => {
    const totalBirds = records.reduce((sum, r) => sum + (Number(r.birdCount) || 0), 0)
    const avgWeight = records.length
      ? records.reduce((sum, r) => sum + (Number(r.birdWeight) || 0), 0) / records.length
      : 0
    const protectedFlocks = records.filter((r) => r.vaccinationStatus === 'Up to Date').length
    const pendingVaccines = records.filter((r) => r.vaccinationStatus === 'Pending').length
    const overdueVaccines = records.filter((r) => r.vaccinationStatus === 'Overdue').length
    const healthScore = Math.max(62, Math.min(98, 96 - overdueVaccines * 9 - pendingVaccines * 4))

    const atRiskBirds = records
      .filter((r) => r.vaccinationStatus === 'Overdue')
      .reduce((sum, r) => sum + (Number(r.birdCount) || 0), 0)
    const healthyBirds = Math.max(0, totalBirds - atRiskBirds)
    const mortalityRate = (100 - healthScore) * 0.12 + 1.2
    const estimatedRevenue = totalBirds * avgWeight * 3.40
    const dailyFeedConsumption = totalBirds * 0.11

    return {
      totalBirds,
      avgWeight,
      feedRecords: records.filter((r) => r.feedType).length,
      protectedFlocks,
      pendingVaccines,
      overdueVaccines,
      healthScore,
      totalRecords: records.length,
      healthyBirds,
      atRiskBirds,
      mortalityRate,
      estimatedRevenue,
      dailyFeedConsumption,
    }
  }, [records])

  return { records, setRecords: setData, summary, loading, error, isOffline }
}
