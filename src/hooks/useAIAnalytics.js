import { useMemo } from 'react'
import useRealtimePoultry from './useRealtimePoultry.js'

/**
 * AI analytics hook that computes predictions, efficiency scores, and agritech insights.
 */
export default function useAIAnalytics() {
  const { records, loading, error, isOffline } = useRealtimePoultry()

  const analyticsData = useMemo(() => {
    if (!records.length) {
      return {
        predictions: [],
        fcrScore: 0,
        projectedRevenue: 0,
        performanceScore: 100,
        insights: [],
      }
    }

    let totalBirds = 0
    let totalWeight = 0
    let totalScore = 0
    let totalFCR = 0

    // Compute metrics for each flock
    const predictions = records.map((flock) => {
      if (!flock) return null
      const id = flock.id || `temp-${Math.random()}`
      const { breed, birdCount = 100, birdAge = 30, birdWeight = 1.5, vaccinationStatus = 'Up to Date' } = flock
      totalBirds += birdCount
      totalWeight += birdCount * birdWeight

      // 1. Breed-specific characteristics
      let targetFCR = 1.6
      let maxWeight = 3.2
      let marketPricePerKg = 4.8 // in USD

      if (breed === 'Layer') {
        targetFCR = 2.1
        maxWeight = 2.0
        marketPricePerKg = 3.9
      } else if (breed === 'Broiler') {
        targetFCR = 1.5
        maxWeight = 3.5
        marketPricePerKg = 5.2
      } else if (breed === 'Dual Purpose') {
        targetFCR = 1.9
        maxWeight = 2.8
        marketPricePerKg = 4.5
      }

      // 2. Feed Conversion Ratio calculation (FCR)
      // Standard heuristic: heavier birds that eat less have better FCR
      // We will compute FCR using pseudo-realistic parameters
      const seed = String(id).charCodeAt(0) || 1
      const dailyFeed = flock.feedIntake || 110 // g/day
      const weightGainRate = birdWeight / Math.max(1, birdAge) // kg/day
      
      // FCR = Feed Consumed (kg) / Weight Gain (kg)
      // For estimation: FCR = (Daily Feed in kg * age) / currentWeight
      const calculatedFCR = Math.max(1.2, Math.round(((dailyFeed / 1000) * birdAge / Math.max(0.1, birdWeight)) * 100) / 100)
      totalFCR += calculatedFCR

      // 3. Growth Prediction (Polynomial projection to day 30, 60, 90)
      const projectWeight = (days) => {
        const targetAge = birdAge + days
        // Broiler sigmoid growth approximation: weight = maxWeight / (1 + e^(-k * (age - age_midpoint)))
        const k = 0.065
        const x0 = breed === 'Broiler' ? 28 : 45
        const projected = maxWeight / (1 + Math.exp(-k * (targetAge - x0)))
        return Math.max(birdWeight, Math.round(projected * 100) / 100)
      }

      const weight30d = projectWeight(30)
      const weight60d = projectWeight(60)
      const weight90d = projectWeight(90)

      // 4. Revenue Estimation
      const currentValuation = birdCount * birdWeight * marketPricePerKg
      const projectedValuation30d = birdCount * weight30d * marketPricePerKg
      const projectedValuation60d = birdCount * weight60d * marketPricePerKg

      // 5. Performance scoring (0-100)
      let score = 100
      if (calculatedFCR > targetFCR * 1.25) score -= 15
      if (calculatedFCR > targetFCR * 1.5) score -= 15
      if (vaccinationStatus === 'Overdue') score -= 20
      if (vaccinationStatus === 'Pending') score -= 8
      if (birdWeight < (maxWeight * (birdAge / 60))) score -= 10 // slow growth
      const performance = Math.max(50, score)
      totalScore += performance

      return {
        id,
        breed,
        birdCount,
        birdAge,
        currentWeight: birdWeight,
        fcr: calculatedFCR,
        targetFCR,
        performanceScore: performance,
        valuations: {
          current: currentValuation,
          projected30d: projectedValuation30d,
          projected60d: projectedValuation60d,
        },
        timeline: [
          { age: birdAge, weight: birdWeight, label: 'Current' },
          { age: birdAge + 30, weight: weight30d, label: '+30 Days' },
          { age: birdAge + 60, weight: weight60d, label: '+60 Days' },
          { age: birdAge + 90, weight: weight90d, label: '+90 Days' },
        ],
      }
    })

    const validPredictions = predictions.filter(Boolean)
    const count = validPredictions.length || 1
    const avgFCR = Math.round((totalFCR / count) * 100) / 100
    const overallPerformance = Math.round(totalScore / count)
    const totalCurrentRevenue = validPredictions.reduce((sum, p) => sum + (p.valuations?.current || 0), 0)
    const totalProjectedRevenue30d = validPredictions.reduce((sum, p) => sum + (p.valuations?.projected30d || 0), 0)

    // Compute AI Insights & Recommendations
    const insights = []
    
    // Rule 1: FCR efficiency
    if (avgFCR > 1.8) {
      insights.push({
        type: 'warning',
        title: 'Feed Efficiency Low',
        detail: `Average FCR is ${avgFCR}. Target is below 1.7. Suggests feed wastage or inadequate nutrition. Consider upgrading feed quality or switching suppliers.`,
        action: 'Optimize Feed Formula',
      })
    } else {
      insights.push({
        type: 'success',
        title: 'Optimal Feed Conversion',
        detail: `Average FCR is stable at ${avgFCR}, indicating high feed conversion efficiency. Maintain current feed schedule.`,
        action: 'Log Feed Batch Details',
      })
    }

    // Rule 2: Overdue vaccinations or health
    const overdueFlocks = records.filter(r => r.vaccinationStatus === 'Overdue')
    if (overdueFlocks.length > 0) {
      insights.push({
        type: 'critical',
        title: 'Biosecurity Schedule Breach',
        detail: `${overdueFlocks.length} flock(s) are overdue for scheduled immunizations. High risk of disease vectors affecting feed intake.`,
        action: 'Schedule Immunizations',
      })
    }

    // Rule 3: Harvest predictions
    const readyForHarvest = predictions.filter(p => p.breed === 'Broiler' && p.currentWeight >= 2.8)
    if (readyForHarvest.length > 0) {
      insights.push({
        type: 'info',
        title: 'Harvest Windows Open',
        detail: `${readyForHarvest.length} Broiler flock(s) have reached optimal harvest weight (>= 2.8kg). Delaying harvest will decrease feed efficiency profit margins.`,
        action: 'Initiate Sale Request',
      })
    }

    return {
      predictions,
      fcrScore: avgFCR,
      projectedRevenue: totalProjectedRevenue30d,
      currentRevenue: totalCurrentRevenue,
      performanceScore: overallPerformance,
      insights,
    }
  }, [records])

  return { ...analyticsData, loading, error, isOffline }
}
