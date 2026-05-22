import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/ui'

export default function ChartCard({ title, subtitle, icon: Icon, actions, children, className = '', delay = 0 }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className={cn('rounded-lg border border-white/70 bg-white/82 p-4 shadow-xl shadow-emerald-950/[0.04] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055] sm:p-5', className)}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          {Icon && (
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-emerald-200/70 bg-emerald-50 text-emerald-700 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-200">
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div className="min-w-0">
            <h2 className="font-heading text-lg font-black tracking-tight text-surface-950 dark:text-white">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-surface-500 dark:text-slate-400">{subtitle}</p>}
          </div>
        </div>
        {actions}
      </div>
      {children}
    </motion.section>
  )
}
