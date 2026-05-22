import React from 'react'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Info,
  Lightbulb,
} from 'lucide-react'
import { cn } from '../../lib/ui.js'

const typeMap = {
  critical: {
    container: 'border-red-200/60 bg-red-500/10 text-red-900 dark:border-red-500/20 dark:text-red-200',
    iconBg: 'bg-red-500 text-white',
    icon: AlertCircle,
  },
  warning: {
    container: 'border-amber-200/60 bg-amber-500/10 text-amber-900 dark:border-amber-500/20 dark:text-amber-200',
    iconBg: 'bg-amber-500 text-white',
    icon: AlertTriangle,
  },
  success: {
    container: 'border-emerald-200/60 bg-emerald-500/10 text-emerald-900 dark:border-emerald-500/20 dark:text-emerald-200',
    iconBg: 'bg-emerald-500 text-white',
    icon: CheckCircle2,
  },
  info: {
    container: 'border-sky-200/60 bg-sky-500/10 text-sky-900 dark:border-sky-500/20 dark:text-sky-200',
    iconBg: 'bg-sky-500 text-white',
    icon: Info,
  },
}

export default function AIInsightCard({ insight, delay = 0, onActionClick }) {
  const { type = 'info', title, detail, action } = insight
  const config = typeMap[type] || typeMap.info
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        'relative overflow-hidden rounded-xl border p-5 shadow-lg backdrop-blur-2xl transition-all duration-300',
        config.container
      )}
    >
      {/* Cool animated gradient background border effect */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-emerald-500/5 via-green-500/0 to-emerald-400/5 opacity-50" />

      <div className="flex items-start gap-4">
        <div className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-lg shadow-md', config.iconBg)}>
          <Icon className="h-4.5 w-4.5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-heading text-sm font-black tracking-tight text-surface-950 dark:text-white">
              {title}
            </h4>
            <span className="flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-300">
              <Lightbulb className="h-2 w-2" />
              AI Insight
            </span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed opacity-85 font-medium">
            {detail}
          </p>

          {action && (
            <button
              type="button"
              onClick={onActionClick}
              className="mt-4 flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 dark:text-emerald-300 dark:hover:text-emerald-200 transition"
            >
              {action}
              <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
