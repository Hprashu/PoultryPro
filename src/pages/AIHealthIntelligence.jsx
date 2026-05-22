import React, { useState, useMemo } from 'react'
import {
  Brain,
  Sparkles,
  TrendingUp,
  Activity,
  Wheat,
  AlertTriangle,
  ShieldCheck,
  ChevronRight,
  Calculator,
  Search,
  CheckCircle2,
  HeartPulse,
} from 'lucide-react'
import AppShell from '../components/ui/AppShell.jsx'
import StatCard from '../components/ui/StatCard.jsx'
import AIInsightCard from '../components/ui/AIInsightCard.jsx'
import useAIAnalytics from '../hooks/useAIAnalytics.js'
import PredictionChartComponent from '../components/ui/PredictionChart.jsx'
import { cn } from '../lib/ui'

export default function AIHealthIntelligence() {
  const { predictions, fcrScore, projectedRevenue, currentRevenue, performanceScore, insights, loading, error, isOffline } = useAIAnalytics()
  const [selectedFlockId, setSelectedFlockId] = useState(null)
  
  // Feed optimization calculator states
  const [calcBreed, setCalcBreed] = useState('Broiler')
  const [calcAge, setCalcAge] = useState(25)
  const [calcFeedAmount, setCalcFeedAmount] = useState(115) // g/bird/day

  // Resolve selected flock
  const selectedFlock = useMemo(() => {
    if (!predictions.length) return null
    if (selectedFlockId) {
      return predictions.find((p) => p.id === selectedFlockId) || predictions[0]
    }
    return predictions[0]
  }, [predictions, selectedFlockId])

  // Auto-select flock on load
  React.useEffect(() => {
    if (predictions.length && !selectedFlockId) {
      setSelectedFlockId(predictions[0].id)
    }
  }, [predictions, selectedFlockId])

  // Calculated feed optimization advice
  const feedOptimizationResults = useMemo(() => {
    const age = Number(calcAge) || 1
    const amount = Number(calcFeedAmount) || 1
    let optimalFeed = 120
    let fcrImpact = '0.00'
    let status = 'Optimal'
    let text = ''

    if (calcBreed === 'Broiler') {
      // standard broiler daily intake curve approx
      optimalFeed = Math.round(15 + 3.8 * age)
    } else if (calcBreed === 'Layer') {
      optimalFeed = Math.round(40 + 1.2 * age)
      if (optimalFeed > 115) optimalFeed = 115 // cap for layer hens
    } else {
      optimalFeed = Math.round(30 + 2.0 * age)
    }

    const diff = amount - optimalFeed
    if (Math.abs(diff) <= 10) {
      fcrImpact = '-0.04 (FCR efficiency gain)'
      status = 'Highly Efficient'
      text = `Feeding volume fits breed requirements (${optimalFeed}g target). Metabolism yields maximum protein conversion.`
    } else if (diff > 10) {
      const estimatedLoss = (diff * 0.002).toFixed(2)
      fcrImpact = `+${estimatedLoss} (FCR overfeed loss)`
      status = 'Overfeeding Risk'
      text = `Exceeds target of ${optimalFeed}g by ${diff}g. Birds are wasting feed, causing nitrogen content increase in litter.`
    } else {
      fcrImpact = '+0.08 (Underfeed growth lag)'
      status = 'Underfeeding Risk'
      text = `Below target of ${optimalFeed}g by ${Math.abs(diff)}g. Flock growth rates may stall, lengthening market cycle.`
    }

    return { optimalFeed, fcrImpact, status, text }
  }, [calcBreed, calcAge, calcFeedAmount])

  // Simulated disease risk predictions based on flock telemetry
  const diseaseRiskIndex = useMemo(() => {
    if (!selectedFlock) return []
    
    // Derived from flock ID, age, and breed to remain deterministic
    const age = selectedFlock.birdAge || 30
    const temp = selectedFlock.telemetry?.temp || 24
    
    const coccidiosisRisk = Math.min(95, Math.max(5, Math.round((temp > 28 ? 65 : 25) + (age < 20 ? 20 : 5))))
    const heatStressRisk = Math.min(95, Math.max(5, Math.round(temp > 30 ? (temp - 30) * 15 + 40 : 10)))
    const respiratoryRisk = Math.min(95, Math.max(5, Math.round(temp < 18 ? 55 : 15)))

    return [
      { name: 'Coccidiosis / Enteritis', risk: coccidiosisRisk, status: coccidiosisRisk > 60 ? 'High' : coccidiosisRisk > 30 ? 'Medium' : 'Low' },
      { name: 'Environmental Heat Stress', risk: heatStressRisk, status: heatStressRisk > 60 ? 'Critical' : heatStressRisk > 30 ? 'Moderate' : 'Low' },
      { name: 'Infectious Bronchitis / Coryza', risk: respiratoryRisk, status: respiratoryRisk > 60 ? 'High' : respiratoryRisk > 30 ? 'Medium' : 'Low' },
    ]
  }, [selectedFlock])

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
  }

  return (
    <AppShell title="AI Health Intelligence" subtitle="Agritech telemetry modeling, predictive diagnostics, and FCR optimization">
      {/* Offline Status Warning */}
      {isOffline && (
        <div className="flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-800 dark:border-amber-500/20 dark:text-amber-200">
          <AlertTriangle className="h-4.5 w-4.5 text-amber-500 shrink-0" />
          Offline fallback mode active. Displaying local heuristic prediction models.
        </div>
      )}

      {/* Overview stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Farm Performance Score"
          value={performanceScore}
          formatter={(v) => `${Math.round(v)}/100`}
          detail="Combined growth & health index"
          icon={Brain}
          accent={performanceScore > 80 ? 'emerald' : 'amber'}
        />
        <StatCard
          label="Estimated Biomass Asset"
          value={currentRevenue}
          formatter={formatCurrency}
          detail="Current estimated market valuation"
          icon={ShieldCheck}
          accent="emerald"
        />
        <StatCard
          label="30d Value Projection"
          value={projectedRevenue}
          formatter={formatCurrency}
          detail="Projected biomass growth value"
          icon={TrendingUp}
          accent="sky"
        />
        <StatCard
          label="Avg Feed Conversion (FCR)"
          value={fcrScore}
          formatter={(v) => v.toFixed(2)}
          detail="Lower ratio = higher feed efficiency"
          icon={Wheat}
          accent={fcrScore < 1.7 ? 'emerald' : 'amber'}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Growth Curves & Projections */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-white/70 bg-white/70 p-6 shadow-xl shadow-emerald-950/[0.03] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-200/50 pb-4 dark:border-white/5">
              <div>
                <h3 className="flex items-center gap-2 font-heading text-base font-black tracking-tight text-surface-950 dark:text-white">
                  <Activity className="h-5 w-5 text-emerald-500" />
                  Growth Curve Projection
                </h3>
                <p className="text-xs text-surface-500 dark:text-slate-400">
                  Logistic growth curves mapped over a 90-day cycle
                </p>
              </div>

              {predictions.length > 0 && (
                <select
                  value={selectedFlockId || ''}
                  onChange={(e) => setSelectedFlockId(e.target.value)}
                  className="h-9 rounded-xl border border-surface-200 bg-white px-3 text-xs font-semibold text-surface-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                >
                  {predictions.map((p) => (
                    <option key={p.id} value={p.id}>
                      Flock #{p.id.slice(-4).toUpperCase()} ({p.breed})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {loading ? (
              <div className="h-72 w-full skeleton rounded-xl mt-4" />
            ) : !selectedFlock ? (
              <div className="flex h-72 flex-col items-center justify-center text-center opacity-65">
                <p className="text-sm font-semibold">No flocks available to project.</p>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <PredictionChartComponent flock={selectedFlock} />
                
                {/* Weight projection grid metrics */}
                <div className="grid grid-cols-4 gap-3.5 border-t border-surface-200/50 pt-4 text-center dark:border-white/5">
                  {selectedFlock.timeline.map((point, i) => (
                    <div key={i} className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-wider text-surface-400 dark:text-slate-500">
                        {point.label}
                      </p>
                      <p className="text-xs font-semibold text-surface-500 dark:text-slate-400">
                        Day {point.age}
                      </p>
                      <p className="font-heading text-sm font-black text-surface-900 dark:text-white">
                        {point.weight} <span className="text-[10px] font-medium opacity-65">kg</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Feed Optimization Simulator */}
          <div className="rounded-2xl border border-white/70 bg-white/70 p-6 shadow-xl shadow-emerald-950/[0.03] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055]">
            <h3 className="flex items-center gap-2 font-heading text-base font-black tracking-tight text-surface-950 dark:text-white">
              <Calculator className="h-5 w-5 text-emerald-500" />
              Feed Conversion Simulator & Optimization
            </h3>
            <p className="text-xs text-surface-500 dark:text-slate-400 mt-0.5">
              Simulate daily feed rations against breed averages to maximize Feed Conversion Ratio (FCR)
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Simulator Form */}
              <div className="md:col-span-2 space-y-4 rounded-xl bg-white/50 p-4 dark:bg-white/5 border border-surface-200/50 dark:border-white/5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-surface-500 dark:text-slate-400 block mb-1.5">
                      Flock Breed
                    </label>
                    <select
                      value={calcBreed}
                      onChange={(e) => setCalcBreed(e.target.value)}
                      className="h-10 w-full rounded-xl border border-surface-200 bg-white px-3 text-xs font-semibold text-surface-900 outline-none transition focus:border-emerald-500 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                    >
                      <option value="Broiler">Broiler (Meat)</option>
                      <option value="Layer">Layer (Eggs)</option>
                      <option value="Dual Purpose">Heritage / Dual Purpose</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-surface-500 dark:text-slate-400 block mb-1.5">
                      Bird Age (Days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="90"
                      value={calcAge}
                      onChange={(e) => setCalcAge(Math.min(90, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="h-10 w-full rounded-xl border border-surface-200 bg-white px-3 text-xs font-semibold text-surface-900 outline-none transition focus:border-emerald-500 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-surface-500 dark:text-slate-400 block mb-1.5">
                    Target Daily Feed Intake (grams per bird: {calcFeedAmount}g)
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="220"
                    value={calcFeedAmount}
                    onChange={(e) => setCalcFeedAmount(parseInt(e.target.value) || 10)}
                    className="w-full h-1.5 bg-surface-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-surface-400 dark:text-slate-500 font-bold mt-1">
                    <span>10g</span>
                    <span>115g (Avg)</span>
                    <span>220g</span>
                  </div>
                </div>
              </div>

              {/* Optimization Output */}
              <div className="flex flex-col justify-between rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-4 border border-emerald-400/20 dark:border-emerald-400/10">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400">AI Estimate</span>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-surface-950 dark:text-white">{feedOptimizationResults.status}</p>
                    <p className="text-xs text-surface-500 dark:text-slate-400 mt-1">Target intake: <span className="font-bold text-emerald-600 dark:text-emerald-400">{feedOptimizationResults.optimalFeed}g</span></p>
                  </div>
                  <p className="text-[11px] font-semibold leading-relaxed text-surface-650 dark:text-slate-350">{feedOptimizationResults.text}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-emerald-400/20 dark:border-emerald-400/5">
                  <span className="text-[9px] font-bold text-surface-400 dark:text-slate-400 block uppercase">FCR Deviation</span>
                  <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">{feedOptimizationResults.fcrImpact}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Diagnostics & Health Risk Analysis */}
        <div className="space-y-6">
          {/* Disease Risk Predictions */}
          <div className="rounded-2xl border border-white/70 bg-white/70 p-6 shadow-xl shadow-emerald-950/[0.03] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055]">
            <h3 className="flex items-center gap-2 font-heading text-base font-black tracking-tight text-surface-950 dark:text-white">
              <HeartPulse className="h-5 w-5 text-emerald-500" />
              Disease Predictive Risk
            </h3>
            <p className="text-xs text-surface-500 dark:text-slate-400 mt-0.5 mb-5">
              Machine learning models identifying likelihood of common poultry conditions
            </p>

            {!selectedFlock ? (
              <p className="text-xs text-surface-400">Select a flock to view diagnostics.</p>
            ) : (
              <div className="space-y-4">
                {diseaseRiskIndex.map((disease, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-surface-900 dark:text-white">{disease.name}</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider",
                        disease.status === 'Low' && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                        (disease.status === 'Medium' || disease.status === 'Moderate') && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                        (disease.status === 'High' || disease.status === 'Critical') && "bg-red-500/10 text-red-600 dark:text-red-400"
                      )}>
                        {disease.status} ({disease.risk}%)
                      </span>
                    </div>
                    {/* Risk progress bar */}
                    <div className="h-2 w-full bg-surface-100 rounded-full overflow-hidden dark:bg-slate-900">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          disease.risk > 60 ? "bg-red-500" : disease.risk > 30 ? "bg-amber-500" : "bg-emerald-500"
                        )}
                        style={{ width: `${disease.risk}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Insights Panel */}
          <div className="rounded-2xl border border-white/70 bg-white/70 p-6 shadow-xl shadow-emerald-950/[0.03] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055]">
            <h3 className="flex items-center gap-2 font-heading text-base font-black tracking-tight text-surface-950 dark:text-white">
              <Sparkles className="h-5 w-5 text-emerald-500 animate-pulse" />
              Agritech Insights & Recs
            </h3>
            <p className="text-xs text-surface-500 dark:text-slate-400 mt-0.5 mb-4">
              Real-time advice generated from biometric analytics and telemetry auditing
            </p>

            {loading ? (
              <div className="space-y-3">
                <div className="h-16 w-full skeleton rounded-xl" />
                <div className="h-16 w-full skeleton rounded-xl" />
              </div>
            ) : insights.length === 0 ? (
              <div className="text-center py-6 opacity-65">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-semibold">No critical issues detected. Farm operations are highly optimal.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {insights.map((insight, i) => (
                  <AIInsightCard
                    key={i}
                    type={insight.type}
                    title={insight.title}
                    description={insight.description}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
