import React from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ChevronRight,
  Droplet,
  Heart,
  Scale,
  Thermometer,
  ShieldAlert,
  Wheat,
} from 'lucide-react'
import { cn } from '../../lib/ui.js'

function MetricGauge({ label, value, max = 10, unit = '', status = 'info' }) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  
  const colors = {
    danger: 'bg-red-500 shadow-red-500/20',
    warning: 'bg-amber-500 shadow-amber-500/20',
    success: 'bg-emerald-500 shadow-emerald-500/20',
    info: 'bg-sky-500 shadow-sky-500/20',
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-surface-500 dark:text-slate-400">{label}</span>
        <span className="font-black text-surface-900 dark:text-white">
          {value}
          <span className="text-[10px] font-medium opacity-60 ml-0.5">{unit}</span>
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-100 dark:bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={cn('h-full rounded-full shadow-sm', colors[status])}
        />
      </div>
    </div>
  )
}

export default function HealthCard({ flock, delay = 0, onSelect }) {
  const {
    id,
    breed,
    birdCount,
    birdAge,
    vaccinationStatus,
    telemetry,
    healthStatus,
    healthScore,
    alerts,
  } = flock

  const statusConfig = {
    healthy: {
      border: 'border-emerald-200/60 dark:border-emerald-500/10',
      bg: 'bg-emerald-50/20 dark:bg-emerald-500/5',
      glow: 'shadow-emerald-950/[0.02]',
      badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200 ring-emerald-200 dark:ring-emerald-400/20',
      label: 'Healthy',
      text: 'text-emerald-500',
    },
    warning: {
      border: 'border-amber-200/60 dark:border-amber-500/10',
      bg: 'bg-amber-50/20 dark:bg-amber-500/5',
      glow: 'shadow-amber-950/[0.02]',
      badge: 'bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-200 ring-amber-200 dark:ring-amber-400/20',
      label: 'Warning Risk',
      text: 'text-amber-500',
    },
    critical: {
      border: 'border-red-200/60 dark:border-red-500/10',
      bg: 'bg-red-50/20 dark:bg-red-500/5',
      glow: 'shadow-red-950/[0.02]',
      badge: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-200 ring-red-200 dark:ring-red-400/20',
      label: 'Critical Alert',
      text: 'text-red-500',
    },
  }

  const current = statusConfig[healthStatus] || statusConfig.healthy

  // Determine thresholds for gauge metrics
  const getTempStatus = (temp) => {
    if (temp > 42.0) return 'danger'
    if (temp > 41.7) return 'warning'
    return 'success'
  }

  const getActivityStatus = (act) => {
    if (act <= 3) return 'danger'
    if (act <= 5) return 'warning'
    return 'success'
  }

  const getWeightStatus = (drop) => {
    if (drop <= -10) return 'danger'
    if (drop < -5) return 'warning'
    return 'success'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      whileHover={{ y: -4 }}
      className={cn(
        'group flex flex-col justify-between overflow-hidden rounded-xl border bg-white/70 shadow-lg backdrop-blur-2xl transition dark:bg-white/[0.04]',
        current.border,
        current.glow
      )}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-lg font-black tracking-tight text-surface-950 dark:text-white">
                Flock #{id.slice(-4).toUpperCase()}
              </span>
              <span className="text-xs font-semibold text-surface-400 dark:text-slate-500">
                ({breed})
              </span>
            </div>
            <p className="mt-1 text-xs text-surface-500 dark:text-slate-400">
              {birdCount} birds • {birdAge} days old
            </p>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest ring-1',
                current.badge
              )}
            >
              {current.label}
            </span>
            <div className="flex items-center gap-1">
              <Heart className={cn('h-3.5 w-3.5 fill-current', current.text)} />
              <span className="font-heading text-sm font-black text-surface-900 dark:text-white">
                {healthScore}
                <span className="text-[10px] font-medium opacity-60">/100</span>
              </span>
            </div>
          </div>
        </div>

        {/* Telemetry Gauge Grid */}
        <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          <MetricGauge
            label="Temperature"
            value={telemetry.temp}
            max={43}
            unit="°C"
            status={getTempStatus(telemetry.temp)}
          />
          <MetricGauge
            label="Activity"
            value={telemetry.activity}
            max={10}
            unit="/10"
            status={getActivityStatus(telemetry.activity)}
          />
          <MetricGauge
            label="7d Growth"
            value={telemetry.weightDrop}
            max={10}
            unit="%"
            status={getWeightStatus(telemetry.weightDrop)}
          />
        </div>

        {/* Additional Details */}
        <div className="mt-4 flex items-center justify-between border-t border-surface-100 pt-3 text-xs text-surface-500 dark:border-white/5 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Wheat className="h-3.5 w-3.5 text-amber-500/70" />
            Feed: {telemetry.feedIntake}g
          </span>
          <span className="flex items-center gap-1">
            <Droplet className="h-3.5 w-3.5 text-sky-500/70" />
            Water: {telemetry.waterIntake}ml
          </span>
          <span className="flex items-center gap-1">
            <Scale className="h-3.5 w-3.5 text-emerald-500/70" />
            Status: {vaccinationStatus}
          </span>
        </div>

        {/* Alerts section */}
        {alerts.length > 0 && (
          <div className="mt-4 space-y-1.5">
            {alerts.map((alert, i) => (
              <div
                key={i}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-medium leading-normal border',
                  alert.type === 'critical'
                    ? 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300'
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300'
                )}
              >
                {alert.type === 'critical' ? (
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                )}
                <span className="truncate">{alert.detail}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {onSelect && (
        <button
          type="button"
          onClick={() => onSelect(flock)}
          className={cn(
            'flex w-full items-center justify-between border-t border-surface-100 px-5 py-3 text-xs font-black tracking-wide uppercase transition hover:bg-surface-50 dark:border-white/5 dark:hover:bg-white/5',
            current.text
          )}
        >
          View Health Diagnostic Timeline
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </motion.div>
  )
}
