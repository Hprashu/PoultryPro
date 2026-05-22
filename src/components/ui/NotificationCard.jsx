import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Info, Zap } from 'lucide-react'
import { cn } from '../../lib/ui'

const styles = {
  critical: {
    icon: AlertTriangle,
    className: 'border-red-200/80 bg-red-50/80 text-red-700 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-200',
  },
  warning: {
    icon: Zap,
    className: 'border-amber-200/80 bg-amber-50/80 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200',
  },
  success: {
    icon: CheckCircle2,
    className: 'border-emerald-200/80 bg-emerald-50/80 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200',
  },
  info: {
    icon: Info,
    className: 'border-sky-200/80 bg-sky-50/80 text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200',
  },
}

export default function NotificationCard({ type = 'info', title, detail, meta, delay = 0 }) {
  const config = styles[type] || styles.info
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.35 }}
      className={cn('flex items-start gap-3 rounded-lg border p-3.5 backdrop-blur-xl', config.className)}
    >
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/65 dark:bg-white/10">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">{title}</p>
        <p className="mt-0.5 text-sm opacity-78">{detail}</p>
      </div>
      {meta && <span className="shrink-0 text-xs font-bold opacity-65">{meta}</span>}
    </motion.div>
  )
}
