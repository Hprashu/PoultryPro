import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  ChartSpline,
  CircleGauge,
  Egg,
  Leaf,
  ShieldCheck,
  ThermometerSun,
  Wheat,
  Warehouse,
  TrendingUp,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Legend,
} from 'recharts'
import AppShell from '../components/ui/AppShell.jsx'
import StatCard from '../components/ui/StatCard.jsx'
import AlertCard from '../components/ui/AlertCard.jsx'
import AnalyticsCard from '../components/ui/AnalyticsCard.jsx'
import { DashboardSkeleton } from '../components/ui/Skeletons.jsx'
import useRealtimePoultry from '../hooks/useRealtimePoultry.js'
import { cn, formatCompactNumber } from '../lib/ui'

const MOCK_RECORDS = [
  { id: 'mock-1', breed: 'Leghorn', birdCount: 250, birdAge: 45, birdWeight: 1.8, feedType: 'Layer Mash', vaccinationStatus: 'Up to Date' },
  { id: 'mock-2', breed: 'Broiler', birdCount: 500, birdAge: 28, birdWeight: 2.1, feedType: 'Finisher', vaccinationStatus: 'Pending' },
  { id: 'mock-3', breed: 'Layer', birdCount: 300, birdAge: 60, birdWeight: 1.9, feedType: 'Layer Mash', vaccinationStatus: 'Up to Date' },
  { id: 'mock-4', breed: 'Rhode Island Red', birdCount: 150, birdAge: 15, birdWeight: 0.6, feedType: 'Starter', vaccinationStatus: 'Overdue' },
]

const palette = ['#10b981', '#84cc16', '#f59e0b', '#38bdf8', '#8b5cf6', '#ef4444']

const tooltipStyle = {
  border: '1px solid rgba(148, 163, 184, 0.22)',
  borderRadius: 8,
  boxShadow: '0 18px 40px rgba(15, 23, 42, 0.12)',
  background: 'rgba(255,255,255,0.96)',
}

function getFallbackRecords() {
  const local = window.localStorage.getItem('poultry_records')
  if (local) return JSON.parse(local)

  window.localStorage.setItem('poultry_records', JSON.stringify(MOCK_RECORDS))
  return MOCK_RECORDS
}

function EmptyChart({ label }) {
  return (
    <div className="grid h-full min-h-56 place-items-center rounded-lg border border-dashed border-surface-200 bg-surface-50/70 text-sm font-semibold text-surface-400 dark:border-white/10 dark:bg-white/5 dark:text-slate-500">
      {label}
    </div>
  )
}

function sparklineFrom(records, key, fallback = [16, 24, 18, 32, 28, 36]) {
  const data = [...records]
    .slice(0, 8)
    .reverse()
    .map((record, index) => ({ name: String(index + 1), value: Number(record[key]) || 0 }))

  if (data.length > 1) return data
  return fallback.map((value, index) => ({ name: String(index + 1), value }))
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { records, summary, loading, error, isOffline: permissionWarning } = useRealtimePoultry()
  const [shouldRenderCharts, setShouldRenderCharts] = useState(false)

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setShouldRenderCharts(true), 250)
      return () => clearTimeout(timer)
    }
  }, [loading])

  const growthData = useMemo(() => [...records]
    .sort((a, b) => (Number(a.birdAge) || 0) - (Number(b.birdAge) || 0))
    .map((record, index) => ({
      name: `${Number(record.birdAge) || index + 1}d`,
      weight: Number(record.birdWeight) || 0,
      birds: Number(record.birdCount) || 0,
    })), [records])

  const feedDistributionData = useMemo(() => {
    const distribution = records.reduce((acc, record) => {
      const feedType = record.feedType || 'Unknown'
      acc[feedType] = (acc[feedType] || 0) + (Number(record.birdCount) || 0)
      return acc
    }, {})

    return Object.entries(distribution).map(([name, count], index) => ({
      name,
      count,
      fill: palette[index % palette.length],
    }))
  }, [records])

  const breedData = useMemo(() => {
    const distribution = records.reduce((acc, record) => {
      const breed = record.breed || 'Unknown'
      acc[breed] = (acc[breed] || 0) + (Number(record.birdCount) || 0)
      return acc
    }, {})

    return Object.entries(distribution)
      .map(([breed, count]) => ({ breed, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [records])

  // Pie chart vaccination data
  const vaccinationProgressData = useMemo(() => [
    { name: 'Up to Date', value: summary.protectedFlocks || 0, fill: '#10b981' },
    { name: 'Pending', value: summary.pendingVaccines || 0, fill: '#f59e0b' },
    { name: 'Overdue', value: summary.overdueVaccines || 0, fill: '#ef4444' },
  ].filter(item => item.value > 0), [summary])

  // Revenue chart data
  const revenueData = useMemo(() => [...records]
    .sort((a, b) => (Number(a.birdAge) || 0) - (Number(b.birdAge) || 0))
    .map((record, index) => {
      const weight = Number(record.birdWeight) || 0
      const count = Number(record.birdCount) || 0
      const rev = count * weight * 3.40
      return {
        name: `${Number(record.birdAge) || index + 1}d`,
        revenue: Math.round(rev),
      }
    }), [records])

  // Mortality trend data
  const mortalityTrendData = useMemo(() => [...records]
    .sort((a, b) => (Number(a.birdAge) || 0) - (Number(b.birdAge) || 0))
    .map((record, index) => {
      const count = Number(record.birdCount) || 0
      const status = record.vaccinationStatus || 'Up to Date'
      const age = Number(record.birdAge) || 0
      const riskFactor = status === 'Overdue' ? 0.04 : status === 'Pending' ? 0.02 : 0.012
      const estimatedLoss = Math.round(count * (riskFactor + (age * 0.0003)))
      return {
        name: `${age}d`,
        losses: estimatedLoss,
        threshold: Math.round(count * 0.08), // standard 8% threshold
      }
    }), [records])

  const insights = useMemo(() => {
    const list = []

    if (summary.overdueVaccines > 0) {
      list.push({
        id: 'vac-overdue',
        type: 'critical',
        title: 'Vaccination risk detected',
        detail: `${summary.overdueVaccines} flock records need immediate vaccine administration.`,
        meta: 'Overdue',
      })
    }

    if (summary.pendingVaccines > 0) {
      list.push({
        id: 'vac-pending',
        type: 'warning',
        title: 'Pending health workflow',
        detail: `${summary.pendingVaccines} flock records are awaiting scheduled vaccination updates.`,
        meta: 'Pending',
      })
    }

    if (summary.avgWeight > 0 && summary.avgWeight < 1.1) {
      list.push({
        id: 'weight-low',
        type: 'warning',
        title: 'Growth variance alert',
        detail: 'Average flock weight is below the standard optimal benchmark for growth cycles.',
        meta: 'Growth',
      })
    }

    if (!list.length) {
      list.push({
        id: 'all-clear',
        type: records.length ? 'success' : 'info',
        title: records.length ? 'Farm systems healthy' : 'Awaiting farm records',
        detail: records.length ? 'All flocks are vaccine-protected with standard biosecurity indicators.' : 'Register active flocks in Flock Manager to unlock live command views.',
        meta: records.length ? 'Live' : 'Setup',
      })
    }

    return list
  }, [records.length, summary])

  const statCards = [
    {
      label: 'Total Birds',
      value: summary.totalBirds,
      detail: `${records.length} active flocks`,
      trend: records.length ? 'Sync' : 'Setup',
      icon: Warehouse,
      accent: 'emerald',
      miniData: sparklineFrom(records, 'birdCount'),
      formatter: (value) => formatCompactNumber(Math.round(value)),
    },
    {
      label: 'Healthy Birds',
      value: summary.healthyBirds,
      detail: 'Vaccine protected',
      trend: `${summary.totalBirds ? Math.round((summary.healthyBirds / summary.totalBirds) * 100) : 100}%`,
      trendDirection: 'up',
      icon: ShieldCheck,
      accent: 'green',
      miniData: records.map(r => ({ value: r.vaccinationStatus !== 'Overdue' ? Number(r.birdCount) : 0 })),
      formatter: (value) => formatCompactNumber(Math.round(value)),
    },
    {
      label: 'At-Risk Birds',
      value: summary.atRiskBirds,
      detail: 'Vaccine overdue',
      trend: summary.atRiskBirds > 0 ? 'Urgent' : 'Optimal',
      trendDirection: summary.atRiskBirds > 0 ? 'down' : 'up',
      icon: AlertTriangle,
      accent: 'red',
      miniData: records.map(r => ({ value: r.vaccinationStatus === 'Overdue' ? Number(r.birdCount) : 0 })),
      formatter: (value) => formatCompactNumber(Math.round(value)),
    },
    {
      label: 'Mortality Rate',
      value: summary.mortalityRate,
      detail: 'Estimated losses',
      trend: summary.mortalityRate < 2.5 ? 'Good' : 'Watch',
      trendDirection: summary.mortalityRate < 2.5 ? 'up' : 'down',
      icon: Activity,
      accent: 'amber',
      miniData: [2.1, 1.9, 2.3, 1.8, summary.mortalityRate].map((v, i) => ({ name: String(i), value: v })),
      formatter: (value) => `${value.toFixed(2)}%`,
    },
    {
      label: 'Est. Revenue',
      value: summary.estimatedRevenue,
      detail: 'Flock valuation',
      trend: 'Market FCR',
      icon: CircleGauge,
      accent: 'sky',
      miniData: records.map(r => ({ value: (Number(r.birdCount) || 0) * (Number(r.birdWeight) || 0) * 3.40 })),
      formatter: (value) => `$${formatCompactNumber(Math.round(value))}`,
    },
    {
      label: 'Feed Consumption',
      value: summary.dailyFeedConsumption,
      detail: 'Daily intake est.',
      trend: 'Feed FCR',
      icon: Wheat,
      accent: 'violet',
      miniData: records.map(r => ({ value: (Number(r.birdCount) || 0) * 0.11 })),
      formatter: (value) => `${formatCompactNumber(Math.round(value))} kg`,
    },
  ]

  return (
    <AppShell
      title="AI Farm Command Center"
      subtitle="Real-time flock intelligence, health alerts, and smart production visibility."
    >
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50/90 p-4 text-red-700 shadow-sm dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-200">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-bold">Dashboard connection issue</p>
            <p className="mt-1 text-sm">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-700"
            >
              Reload dashboard
            </button>
          </div>
        </div>
      )}

      {permissionWarning && (
        <AlertCard
          type="warning"
          title="Cloud Database Sync Blocked"
          detail="Security rules blocked this database connection, so PoultryPro seamlessly swapped to localStorage sandbox while maintaining full operational intelligence."
          meta="Sandbox"
        />
      )}

      {loading && !error ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-6">
          {/* Welcome Banner Row */}
          <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.6fr_0.9fr]">
            <div className="rounded-lg border border-white/70 bg-white/82 p-5 shadow-xl shadow-emerald-950/[0.04] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055] sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200">
                  <Brain className="h-3.5 w-3.5 animate-pulse" />
                  PoultryPro AI Operating System
                </span>
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200">
                  Health score {summary.healthScore}%
                </span>
              </div>
              <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_240px] lg:items-end">
                <div>
                  <h2 className="font-heading text-3xl font-black tracking-tight text-surface-950 dark:text-white sm:text-4xl">
                    Agri-intelligent operations, built for commercial success.
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-surface-600 dark:text-slate-300">
                    Oversee flock distribution, biosafety levels, mortality rates, and feed optimization targets from a single premium, real-time command dashboard.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/flocks')}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-green-800 px-4 text-sm font-black text-white shadow-lg shadow-emerald-700/25 transition hover:-translate-y-0.5 hover:shadow-emerald-700/35"
                >
                  <Leaf className="h-4 w-4" />
                  Manage flocks
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-white/70 bg-gradient-to-br from-emerald-950 to-slate-950 p-5 text-white shadow-xl shadow-emerald-950/10 dark:border-white/10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-200/65">AI readiness</p>
                  <p className="mt-1 font-heading text-4xl font-black">{summary.healthScore}%</p>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-lg border border-white/12 bg-white/10">
                  <Activity className="h-6 w-6 text-emerald-200" />
                </div>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/12">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-lime-200 to-amber-200" style={{ width: `${summary.healthScore}%` }} />
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-white/10 p-3">
                  <p className="font-heading text-xl font-black">{summary.pendingVaccines}</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-100/55">Pending</p>
                </div>
                <div className="rounded-lg bg-white/10 p-3">
                  <p className="font-heading text-xl font-black">{summary.overdueVaccines}</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-100/55">Overdue</p>
                </div>
                <div className="rounded-lg bg-white/10 p-3">
                  <p className="font-heading text-xl font-black">{summary.feedRecords}</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-100/55">Feed logs</p>
                </div>
              </div>
            </div>
          </section>

          {/* 6 Stat Cards Row */}
          <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {statCards.map((stat, index) => (
              <StatCard key={stat.label} {...stat} delay={index * 0.05} />
            ))}
          </section>

          {/* Row 1: Growth Intelligence & Vaccination Progress */}
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            {/* Growth Intelligence Area Chart */}
            <AnalyticsCard
              className="xl:col-span-2"
              title="Growth Intelligence"
              subtitle="Weight curves relative to flock count overlays"
              icon={ChartSpline}
              metric={summary.avgWeight ? `${summary.avgWeight.toFixed(2)} kg` : '--'}
              change="Stable"
              changeDirection="up"
              changeLabel="cycle weight average"
            >
              <div className="h-72 w-full" style={{ minWidth: 0 }}>
                {shouldRenderCharts && growthData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={growthData} margin={{ top: 12, right: 12, left: -22, bottom: 0 }}>
                      <defs>
                        <linearGradient id="growthWeightGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.01} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 8" className="dark:stroke-white/5" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [name === 'weight' ? `${Number(value).toFixed(2)} kg` : `${value} birds`, name === 'weight' ? 'Weight' : 'Birds']} />
                      <Area type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={3} fill="url(#growthWeightGradient)" isAnimationActive />
                      <Line type="monotone" dataKey="birds" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart label="No active growth data logs" />
                )}
              </div>
            </AnalyticsCard>

            {/* Vaccination Progress Pie Chart */}
            <AnalyticsCard
              title="Vaccination Status"
              subtitle="Breakdown of biosecurity schedules"
              icon={ShieldCheck}
              metric={`${summary.protectedFlocks || 0} flocks`}
              change={`${summary.healthScore}%`}
              changeDirection={summary.healthScore > 80 ? 'up' : 'down'}
              changeLabel="health compliance"
            >
              <div className="h-72 w-full flex flex-col justify-center" style={{ minWidth: 0 }}>
                {shouldRenderCharts && vaccinationProgressData.length ? (
                  <ResponsiveContainer width="100%" height="90%">
                    <PieChart>
                      <Pie
                        data={vaccinationProgressData}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {vaccinationProgressData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value} flocks`, 'Count']} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 700 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart label="No active vaccination schedules" />
                )}
              </div>
            </AnalyticsCard>
          </section>

          {/* Row 2: Revenue, Feed, Mortality Trend */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Revenue Area Chart */}
            <AnalyticsCard
              title="Est. Revenue Analytics"
              subtitle="Sales evaluation by age cohorts"
              icon={CircleGauge}
              metric={`$${formatCompactNumber(Math.round(summary.estimatedRevenue))}`}
              change="+$3.40/kg"
              changeDirection="up"
              changeLabel="average valuation"
            >
              <div className="h-56 w-full" style={{ minWidth: 0 }}>
                {shouldRenderCharts && revenueData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.01} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 8" className="dark:stroke-white/5" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                      <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#revenueGradient)" isAnimationActive />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart label="No active records for revenue analysis" />
                )}
              </div>
            </AnalyticsCard>

            {/* Feed Distribution Bar Chart */}
            <AnalyticsCard
              title="Feed Consumption Mix"
              subtitle="Population active on feed types"
              icon={Wheat}
              metric={`${records.filter(r => r.feedType).length} logs`}
              change="FCR 1.82"
              changeDirection="up"
              changeLabel="target ratio"
            >
              <div className="h-56 w-full" style={{ minWidth: 0 }}>
                {shouldRenderCharts && feedDistributionData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={feedDistributionData} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 8" className="dark:stroke-white/5" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <Tooltip cursor={{ fill: 'rgba(16,185,129,0.06)' }} contentStyle={tooltipStyle} formatter={(value) => [`${value.toLocaleString()} birds`, 'Population']} />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]} isAnimationActive>
                        {feedDistributionData.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart label="No feed distribution records" />
                )}
              </div>
            </AnalyticsCard>

            {/* Mortality Trend Line Chart */}
            <AnalyticsCard
              title="Mortality Loss Curve"
              subtitle="Attrition counts vs safety threshold"
              icon={Activity}
              metric={`${Math.round(summary.totalBirds * (summary.mortalityRate / 100))} birds`}
              change={`${summary.mortalityRate.toFixed(2)}%`}
              changeDirection={summary.mortalityRate < 2.5 ? 'up' : 'down'}
              changeLabel="projected loss rate"
            >
              <div className="h-56 w-full" style={{ minWidth: 0 }}>
                {shouldRenderCharts && mortalityTrendData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mortalityTrendData} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 8" className="dark:stroke-white/5" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Line type="monotone" dataKey="losses" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive />
                      <Line type="monotone" dataKey="threshold" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1.5} dot={false} isAnimationActive />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart label="No active mortality trend records" />
                )}
              </div>
            </AnalyticsCard>
          </section>

          {/* Row 3: Barn Climate, AI Alerts/Insights, Breed Mix */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Barn Climate Environment Snapshot */}
            <AnalyticsCard title="Barn Climate Snapshot" subtitle="Operational biosecurity metrics" icon={ThermometerSun}>
              <div className="space-y-3.5">
                {[
                  { label: 'Ambient Temperature', value: '23.8 °C', status: 'Optimal range', icon: ThermometerSun, color: 'text-sky-600 bg-sky-50 dark:text-sky-200 dark:bg-sky-400/10' },
                  { label: 'Rel. Ambient Humidity', value: '64.2%', status: 'Standard range', icon: Activity, color: 'text-cyan-600 bg-cyan-50 dark:text-cyan-200 dark:bg-cyan-400/10' },
                  { label: 'Biosafety Level (AQI)', value: 'AQI 42', status: 'Excellent ventilation', icon: ShieldCheck, color: 'text-emerald-700 bg-emerald-50 dark:text-emerald-200 dark:bg-emerald-400/10' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3.5 rounded-xl border border-surface-200/70 bg-white/70 p-3.5 dark:border-white/10 dark:bg-white/5">
                    <div className={cn('grid h-10 w-10 place-items-center rounded-lg shadow-sm', item.color)}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-surface-900 dark:text-white">{item.label}</p>
                      <p className="text-[11px] font-semibold text-surface-500 dark:text-slate-400">{item.status}</p>
                    </div>
                    <p className="font-heading text-lg font-black text-surface-950 dark:text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </AnalyticsCard>

            {/* AI Insights & Alerts Panel */}
            <AnalyticsCard title="Smart AI Notifications" subtitle="Prioritized flock alerts & updates" icon={Brain}>
              <div className="space-y-3">
                {insights.map((insight, index) => (
                  <AlertCard key={insight.id} {...insight} delay={index * 0.06} />
                ))}
              </div>
            </AnalyticsCard>

            {/* Breed Mix Progression */}
            <AnalyticsCard title="Breed Population Share" subtitle="Largest populations by active breed" icon={Egg}>
              <div className="space-y-3.5">
                {breedData.length ? breedData.map((item, index) => {
                  const max = Math.max(...breedData.map((breed) => breed.count), 1)
                  return (
                    <div key={item.breed} className="space-y-2">
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="font-black text-surface-700 dark:text-slate-200">{item.breed}</span>
                        <span className="font-black text-surface-950 dark:text-white">{formatCompactNumber(item.count)} birds</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-surface-100 dark:bg-white/10">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(item.count / max) * 100}%`, background: palette[index % palette.length] }} />
                      </div>
                    </div>
                  )
                }) : <EmptyChart label="No active breed mix data logs" />}
              </div>
            </AnalyticsCard>
          </section>
        </div>
      )}
    </AppShell>
  )
}
