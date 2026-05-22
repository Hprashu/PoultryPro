import React from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '../../lib/ui.js'

/**
 * AlertCard component for severity-based alerts (low, warning/medium, critical/emergency).
 */
export default function AlertCard({
  id,
  type = 'info', // 'info' | 'warning' | 'critical' | 'success'
  title,
  detail,
  meta,
  onDismiss,
  delay = 0,
}) {
  const typeMap = {
    critical: {
      container: 'border-red-200 bg-red-50/90 text-red-900 dark:border-red-500/20 dark:bg-red-950/15 dark:text-red-200',
      iconBg: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
      icon: AlertCircle,
    },
    warning: {
      container: 'border-amber-200 bg-amber-50/90 text-amber-900 dark:border-amber-500/20 dark:bg-amber-950/15 dark:text-amber-200',
      iconBg: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
      icon: AlertTriangle,
    },
    success: {
      container: 'border-emerald-200 bg-emerald-50/90 text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-950/15 dark:text-emerald-200',
      iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
      icon: Info,
    },
    info: {
      container: 'border-sky-200 bg-sky-50/90 text-sky-900 dark:border-sky-500/20 dark:bg-sky-950/15 dark:text-sky-200',
      iconBg: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
      icon: Info,
    },
  }

  const currentType = typeMap[type] || typeMap.info
  const Icon = currentType.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.98 }}
      transition={{ duration: 0.3, delay }}
      className={cn(
        'relative flex items-start gap-3.5 rounded-xl border p-4 shadow-md backdrop-blur-md',
        currentType.container
      )}
    >
      <div className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-lg shadow-sm', currentType.iconBg)}>
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1 pr-6">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <h4 className="font-heading text-sm font-black tracking-tight">{title}</h4>
          {meta && <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{meta}</span>}
        </div>
        <p className="mt-1 text-xs leading-relaxed opacity-85 font-medium">{detail}</p>
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={() => onDismiss(id)}
          className="absolute top-3.5 right-3.5 grid h-6 w-6 place-items-center rounded-lg opacity-60 transition hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10"
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </motion.div>
  )
}
