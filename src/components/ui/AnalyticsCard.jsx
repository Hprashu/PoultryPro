import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '../../lib/ui.js'

/**
 * AnalyticsCard container with header controls, dynamic metrics, and chart container.
 */
export default function AnalyticsCard({
  title,
  subtitle,
  icon: Icon,
  metric,
  change,
  changeDirection = 'up',
  changeLabel,
  ranges = ['7D', '30D', '90D', 'All'],
  defaultRange = '30D',
  onRangeChange,
  children,
  className,
  delay = 0,
}) {
  const [activeRange, setActiveRange] = useState(defaultRange)

  const handleRangeChange = (range) => {
    setActiveRange(range)
    if (onRangeChange) onRangeChange(range)
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        'flex flex-col rounded-xl border border-white/70 bg-white/82 p-5 shadow-xl shadow-emerald-950/[0.04] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055]',
        className
      )}
    >
      {/* Header section with title and range selector */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="grid h-10 w-10 place-items-center rounded-lg border border-emerald-200/50 bg-emerald-50 text-emerald-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-emerald-300">
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div>
            <h3 className="font-heading text-lg font-black tracking-tight text-surface-950 dark:text-white">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs font-semibold text-surface-500 dark:text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Range Selector */}
        {ranges && ranges.length > 0 && (
          <div className="flex items-center gap-1.5 self-start rounded-lg border border-surface-200 bg-white/50 p-1 shadow-sm dark:border-white/10 dark:bg-slate-900/50 sm:self-center">
            {ranges.map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => handleRangeChange(range)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-xs font-black transition-all',
                  activeRange === range
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-surface-600 hover:bg-surface-100 dark:text-slate-300 dark:hover:bg-white/10'
                )}
              >
                {range}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Metric / Change Overlay */}
      {(metric || change) && (
        <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          {metric && (
            <span className="font-heading text-3xl font-black tracking-tight text-surface-950 dark:text-white">
              {metric}
            </span>
          )}
          {change && (
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-black',
                  changeDirection === 'up'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200'
                    : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-200'
                )}
              >
                {changeDirection === 'up' ? (
                  <TrendingUp className="h-3 w-3 shrink-0" />
                ) : (
                  <TrendingDown className="h-3 w-3 shrink-0" />
                )}
                {change}
              </span>
              {changeLabel && (
                <span className="text-[11px] font-semibold text-surface-400 dark:text-slate-500">
                  {changeLabel}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Chart/Content Area */}
      <div className="mt-5 min-h-[220px] flex-1" style={{ minWidth: 0 }}>
        {children}
      </div>
    </motion.article>
  )
}
