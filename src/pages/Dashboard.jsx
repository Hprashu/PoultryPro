import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
  Volume2,
  Rocket
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
import { useVoice } from '../hooks/useVoice'
import { cn, formatCompactNumber } from '../lib/ui'
import { useAuth } from '../contexts/AuthContext.jsx'

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
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { records, summary, loading, error, isOffline: permissionWarning } = useRealtimePoultry()
  const [shouldRenderCharts, setShouldRenderCharts] = useState(false)
  const { speak, isSpeaking, cancelSpeak } = useVoice()

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Sailada Prasant Kumar'

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

  // Translation helpers for UI
  const localizedCardLabels = {
    total_birds: { en: 'Total Birds', te: 'మొత్తం కోళ్లు', hi: 'कुल मुर्गियां', ta: 'மொத்த பறவைகள்', kn: 'ಒಟ್ಟು ಕೋಳಿಗಳು', mr: 'एकूण कोंबड्या', bn: 'মোট মুরগি' },
    healthy_birds: { en: 'Healthy Birds', te: 'ఆరోగ్యకరమైన కోళ్లు', hi: 'स्वस्थ मुर्गियां', ta: 'ஆரோக்கியமான பறவைகள்', kn: 'ಆರೋಗ್ಯಕರ ಕೋಳಿಗಳು', mr: 'निरोगी कोंबड्या', bn: 'সুস্থ মুরগি' },
    at_risk: { en: 'At-Risk Birds', te: 'ప్రమాదంలో ఉన్న కోళ్లు', hi: 'जोखिम वाली मुर्गियां', ta: 'ஆபத்தில் உள்ள பறவைகள்', kn: 'ಅಪಾಯದಲ್ಲಿರುವ ಕೋಳಿಗಳು', mr: 'धोक्यातील कोंबड्या', bn: 'ঝুঁকিপূর্ণ মুরগি' },
    mortality: { en: 'Mortality Rate', te: 'మరణాల రేటు', hi: 'मृत्यु दर', ta: 'இறப்பு விகிதம்', kn: 'ಮರಣ ಪ್ರಮಾಣ', mr: 'मृत्यू दर', bn: 'মৃত্যু হার' },
    revenue: { en: 'Est. Revenue', te: 'రాబడి అంచనా', hi: 'अनुमानित आय', ta: 'மதிப்பிடப்பட்ட வருவாய்', kn: 'ಅಂದಾಜು ಆದಾಯ', mr: 'अंदाजे महसूल', bn: 'আনুমানিক রাজস্ব' },
    feed: { en: 'Feed Consumption', te: 'మేత వినియోగం', hi: 'चारा खपत', ta: 'தீவன நுகர்வு', kn: 'ಮೇವು ಬಳಕೆ', mr: 'खाद्य वापर', bn: 'খাদ্য ব্যবহার' }
  }

  const getLabel = (key) => {
    const currentLang = i18n.language || 'en'
    return localizedCardLabels[key]?.[currentLang] || localizedCardLabels[key]?.en
  }

  const getFlockDetailText = () => {
    const currentLang = i18n.language || 'en'
    const translations = {
      en: `${records.length} active flocks`,
      te: `${records.length} యాక్టివ్ గుంపులు`,
      hi: `${records.length} सक्रिय झुंड`,
      ta: `${records.length} செயலில் உள்ள மந்தைகள்`,
      kn: `${records.length} ಸಕ್ರಿಯ ಹಿಂಡುಗಳು`,
      mr: `${records.length} कोंबड्यांचे गट`,
      bn: `${records.length}টি সক্রিয় ফ্লক`
    }
    return translations[currentLang] || translations.en
  }

  const protectedText = useMemo(() => {
    const currentLang = i18n.language || 'en'
    const translations = {
      en: 'Vaccine protected',
      te: 'టీకాలు వేయబడినవి',
      hi: 'टीकाकरण सुरक्षित',
      ta: 'தடுப்பூசி பாதுகாக்கப்பட்டது',
      kn: 'ಲಸಿಕೆ ರಕ್ಷಿತ',
      mr: 'लसीकरण सुरक्षित',
      bn: 'টিকা দেওয়া'
    }
    return translations[currentLang] || translations.en
  }, [i18n.language])

  const overdueText = useMemo(() => {
    const currentLang = i18n.language || 'en'
    const translations = {
      en: 'Vaccine overdue',
      te: 'టీకా గడువు దాటినది',
      hi: 'टीकाकरण बकाया',
      ta: 'தடுப்பூசி காலாவதியானது',
      kn: 'ಲಸಿಕೆ ಬಾಕಿ',
      mr: 'लस थकीत',
      bn: 'টিকা বাকি'
    }
    return translations[currentLang] || translations.en
  }, [i18n.language])

  const lossesText = useMemo(() => {
    const currentLang = i18n.language || 'en'
    const translations = {
      en: 'Estimated losses',
      te: 'అంచనా నష్టాలు',
      hi: 'अनुमानित नुकसान',
      ta: 'மதிப்பிடப்பட்ட இழப்புகள்',
      kn: 'ಅಂದಾಜು ನಷ್ಟಗಳು',
      mr: 'अंदाजे नुकसान',
      bn: 'আনুমানিক ক্ষতি'
    }
    return translations[currentLang] || translations.en
  }, [i18n.language])

  const valuationText = useMemo(() => {
    const currentLang = i18n.language || 'en'
    const translations = {
      en: 'Flock valuation',
      te: 'గుంపుల మొత్తం విలువ',
      hi: 'झुंड का मूल्य',
      ta: 'மந்தையின் மதிப்பு',
      kn: 'ಹಿಂಡಿನ ಮೌಲ್ಯಮಾಪನ',
      mr: 'कोंबड्यांचे मूल्यांकन',
      bn: 'মুরগির মূল্য'
    }
    return translations[currentLang] || translations.en
  }, [i18n.language])

  const dailyIntakeText = useMemo(() => {
    const currentLang = i18n.language || 'en'
    const translations = {
      en: 'Daily intake est.',
      te: 'రోజువారీ మేత అంచనా',
      hi: 'दैनिक अनुमानित चारा',
      ta: 'தினசரி தீவன அளவு',
      kn: 'ದೈನಂದಿನ ಆಹಾರ ಅಂದಾಜು',
      mr: 'दैनिक खाद्याचा अंदाज',
      bn: 'দৈনিক খাদ্যের পরিমাণ'
    }
    return translations[currentLang] || translations.en
  }, [i18n.language])

  const readDashboardStatus = () => {
    if (isSpeaking) {
      cancelSpeak()
      return
    }

    const currentLang = i18n.language || 'en'
    const speechText = {
      en: `Farm Status Report. Total Birds: ${summary.totalBirds}. Healthy Birds: ${summary.healthyBirds}. Mortality Rate: ${summary.mortalityRate.toFixed(2)} percent. Farm health score: ${summary.healthScore} percent. You have ${summary.overdueVaccines} overdue vaccines.`,
      te: `ఫామ్ రిపోర్ట్. మొత్తం కోళ్లు: ${summary.totalBirds}. ఆరోగ్యంగా ఉన్న కోళ్లు: ${summary.healthyBirds}. మరణాల రేటు: ${summary.mortalityRate.toFixed(2)} శాతం. ఫామ్ ఆరోగ్య స్కోరు: ${summary.healthScore} శాతం. మీకు ${summary.overdueVaccines} వ్యాక్సినేషన్లు అలర్ట్ లో ఉన్నాయి.`,
      hi: `फार्म रिपोर्ट। कुल मुर्गियां: ${summary.totalBirds}। स्वस्थ मुर्गियां: ${summary.healthyBirds}। मृत्यु दर: ${summary.mortalityRate.toFixed(2)} प्रतिशत। फार्म स्वास्थ्य स्कोर: ${summary.healthScore} प्रतिशत। आपके पास ${summary.overdueVaccines} लंबित टीके हैं।`,
      ta: `பண்ணை அறிக்கை. மொத்த பறவைகள்: ${summary.totalBirds}. ஆரோக்கியமான பறவைகள்: ${summary.healthyBirds}. இறப்பு விகிதம்: ${summary.mortalityRate.toFixed(2)} சதவீதம். பண்ணை சுகாதார மதிப்பெண்: ${summary.healthScore} சதவீதம்.`,
      kn: `ಫಾರ್ಮ್ ವರದಿ. ಒಟ್ಟು ಕೋಳಿಗಳು: ${summary.totalBirds}. ಆರೋಗ್ಯಕರ ಕೋಳಿಗಳು: ${summary.healthyBirds}. ಮರಣ ಪ್ರಮಾಣ: ${summary.mortalityRate.toFixed(2)} ಶೇಕಡಾ.`,
      mr: `फार्म अहवाल. एकूण कोंबड्या: ${summary.totalBirds}. निरोगी कोंबड्या: ${summary.healthyBirds}. मृत्यू दर: ${summary.mortalityRate.toFixed(2)} टक्के.`,
      bn: `খামার রিপোর্ট। মোট মুরগি: ${summary.totalBirds}। সুস্থ মুরগি: ${summary.healthyBirds}। মৃত্যু হার: ${summary.mortalityRate.toFixed(2)} শতাংশ।`
    }

    const text = speechText[currentLang] || speechText.en
    speak(text)
  }

  const statCards = [
    {
      label: getLabel('total_birds'),
      value: summary.totalBirds,
      detail: getFlockDetailText(),
      trend: records.length ? 'Sync' : 'Setup',
      icon: Warehouse,
      accent: 'emerald',
      miniData: sparklineFrom(records, 'birdCount'),
      formatter: (value) => formatCompactNumber(Math.round(value)),
    },
    {
      label: getLabel('healthy_birds'),
      value: summary.healthyBirds,
      detail: protectedText,
      trend: `${summary.totalBirds ? Math.round((summary.healthyBirds / summary.totalBirds) * 100) : 100}%`,
      trendDirection: 'up',
      icon: ShieldCheck,
      accent: 'green',
      miniData: records.map(r => ({ value: r.vaccinationStatus !== 'Overdue' ? Number(r.birdCount) : 0 })),
      formatter: (value) => formatCompactNumber(Math.round(value)),
    },
    {
      label: getLabel('at_risk'),
      value: summary.atRiskBirds,
      detail: overdueText,
      trend: summary.atRiskBirds > 0 ? 'Urgent' : 'Optimal',
      trendDirection: summary.atRiskBirds > 0 ? 'down' : 'up',
      icon: AlertTriangle,
      accent: 'red',
      miniData: records.map(r => ({ value: r.vaccinationStatus === 'Overdue' ? Number(r.birdCount) : 0 })),
      formatter: (value) => formatCompactNumber(Math.round(value)),
    },
    {
      label: getLabel('mortality'),
      value: summary.mortalityRate,
      detail: lossesText,
      trend: summary.mortalityRate < 2.5 ? 'Good' : 'Watch',
      trendDirection: summary.mortalityRate < 2.5 ? 'up' : 'down',
      icon: Activity,
      accent: 'amber',
      miniData: [2.1, 1.9, 2.3, 1.8, summary.mortalityRate].map((v, i) => ({ name: String(i), value: v })),
      formatter: (value) => `${value.toFixed(2)}%`,
    },
    {
      label: getLabel('revenue'),
      value: summary.estimatedRevenue,
      detail: valuationText,
      trend: 'Market FCR',
      icon: CircleGauge,
      accent: 'sky',
      miniData: records.map(r => ({ value: (Number(r.birdCount) || 0) * (Number(r.birdWeight) || 0) * 3.40 })),
      formatter: (value) => `$${formatCompactNumber(Math.round(value))}`,
    },
    {
      label: getLabel('feed'),
      value: summary.dailyFeedConsumption,
      detail: dailyIntakeText,
      trend: 'Feed FCR',
      icon: Wheat,
      accent: 'violet',
      miniData: records.map(r => ({ value: (Number(r.birdCount) || 0) * 0.11 })),
      formatter: (value) => `${formatCompactNumber(Math.round(value))} kg`,
    },
  ]

  const headerActions = (
    <button
      onClick={readDashboardStatus}
      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-black transition ${
        isSpeaking 
          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 animate-pulse'
          : 'border-surface-200 bg-white text-surface-700 hover:border-emerald-200 hover:text-emerald-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300'
      }`}
    >
      <Volume2 className="h-4 w-4" />
      <span>{t('voice.read_alerts')}</span>
    </button>
  )

  return (
    <AppShell
      title={t('nav.dashboard')}
      subtitle={t('app.subtitle')}
      actions={headerActions}
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
                  {t('app.title')}
                </span>
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200">
                  {t('dashboard.farm_score_title')} {summary.healthScore}%
                </span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-350">
                  Seed Stage Startup
                </span>
              </div>
              <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_240px] lg:items-end">
                <div>
                  <h2 className="font-heading text-2xl font-black tracking-tight text-surface-950 dark:text-white sm:text-3xl leading-tight">
                    Welcome to the Command Center, {displayName === 'Farmer' ? 'Sailada Prasant Kumar' : displayName}!
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-relaxed text-surface-650 dark:text-slate-350 font-semibold">
                    PoultryPro OS is running in startup founder mode. Oversee real-time telemetry, biosecurity compliance, and your regional voice assistant deployments from this investor-ready operational console.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/about-founder')}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-green-800 px-4 text-xs font-black text-white shadow-lg shadow-emerald-700/25 transition hover:-translate-y-0.5 hover:shadow-emerald-700/35"
                >
                  <Rocket className="h-4 w-4" />
                  View Startup Vision
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-white/70 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 p-5 text-white shadow-xl shadow-emerald-950/10 dark:border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">Startup Pitch Projection</p>
                  <p className="mt-1 font-heading text-3xl font-black">${formatCompactNumber(summary.estimatedRevenue * 12)} ARR</p>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-lg border border-white/12 bg-white/10">
                  <TrendingUp className="h-6 w-6 text-emerald-300" />
                </div>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/12">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500" style={{ width: `78%` }} />
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-white/5 border border-white/5 p-2">
                  <p className="font-heading text-sm font-black text-emerald-300">Phase 2</p>
                  <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Roadmap</p>
                </div>
                <div className="rounded-lg bg-white/5 border border-white/5 p-2">
                  <p className="font-heading text-sm font-black text-emerald-300">Seed</p>
                  <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Stage</p>
                </div>
                <div className="rounded-lg bg-white/5 border border-white/5 p-2">
                  <p className="font-heading text-sm font-black text-emerald-300">96.4%</p>
                  <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">AI Accuracy</p>
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
              title={t('dashboard.growth_chart')}
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
              title={t('dashboard.vaccination_progress')}
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
              title={t('dashboard.value_projection')}
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
              title={t('dashboard.feed_chart')}
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
              title={t('dashboard.mortality_analytics')}
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
            <AnalyticsCard title={t('dashboard.active_alerts')} subtitle="Prioritized flock alerts & updates" icon={Brain}>
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
