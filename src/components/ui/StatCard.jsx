import React, { useEffect, useState } from 'react'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import { animate, motion } from 'framer-motion'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '../../lib/ui'

function AnimatedValue({ value, formatter }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const controls = animate(0, Number(value) || 0, {
      duration: 0.9,
      ease: 'easeOut',
      onUpdate: (latest) => setDisplay(latest),
    })

    return () => controls.stop()
  }, [value])

  return formatter ? formatter(display) : Math.round(display).toLocaleString()
}

export default function StatCard({
  label,
  value,
  formatter,
  detail,
  trend,
  trendDirection = 'up',
  icon: Icon,
  accent = 'emerald',
  miniData = [],
  delay = 0,
  size = 'md',
  color,
}) {
  const accentMap = {
    emerald: 'from-emerald-500 to-green-800 text-emerald-700 bg-emerald-50 border-emerald-200/70 dark:text-emerald-200 dark:bg-emerald-400/10 dark:border-emerald-400/15',
    amber: 'from-amber-400 to-orange-600 text-amber-700 bg-amber-50 border-amber-200/70 dark:text-amber-200 dark:bg-amber-400/10 dark:border-amber-400/15',
    sky: 'from-sky-400 to-cyan-700 text-sky-700 bg-sky-50 border-sky-200/70 dark:text-sky-200 dark:bg-sky-400/10 dark:border-sky-400/15',
    violet: 'from-violet-500 to-fuchsia-700 text-violet-700 bg-violet-50 border-violet-200/70 dark:text-violet-200 dark:bg-violet-400/10 dark:border-violet-400/15',
    red: 'from-red-500 to-rose-700 text-red-700 bg-red-50 border-red-200/70 dark:text-red-200 dark:bg-red-400/10 dark:border-red-400/15',
    green: 'from-emerald-500 to-green-800 text-emerald-700 bg-emerald-50 border-emerald-200/70 dark:text-emerald-200 dark:bg-emerald-400/10 dark:border-emerald-400/15',
  }
  const accentClasses = accentMap[accent] || accentMap.emerald

  // Resolve Sparkline color
  const defaultColors = {
    emerald: '#10b981',
    green: '#10b981',
    amber: '#f59e0b',
    sky: '#0ea5e9',
    violet: '#8b5cf6',
    red: '#ef4444',
  }
  const chartColor = color || defaultColors[accent] || '#10b981'

  // Size styling
  const containerPadding = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }[size] || 'p-4'

  const iconContainerSize = {
    sm: 'h-9 w-9',
    md: 'h-11 w-11',
    lg: 'h-14 w-14',
  }[size] || 'h-11 w-11'

  const iconSize = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-7 w-7',
  }[size] || 'h-5 w-5'

  const labelSize = {
    sm: 'text-[10px] tracking-[0.12em]',
    md: 'text-xs tracking-[0.16em]',
    lg: 'text-sm tracking-[0.18em]',
  }[size] || 'text-xs tracking-[0.16em]'

  const valueSize = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-4xl sm:text-5xl',
  }[size] || 'text-3xl'

  const detailSize = {
    sm: 'text-[11px] mt-0.5',
    md: 'text-sm mt-1',
    lg: 'text-base mt-2',
  }[size] || 'text-sm mt-1'

  const [shouldRender, setShouldRender] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setShouldRender(true), 200)
    return () => clearTimeout(t)
  }, [])

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      whileHover={{ y: -4 }}
      className={cn(
        "group overflow-hidden rounded-lg border border-white/70 bg-white/82 shadow-xl shadow-emerald-950/[0.04] backdrop-blur-2xl transition dark:border-white/10 dark:bg-white/[0.055]",
        containerPadding
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={cn('grid place-items-center rounded-lg border shadow-sm', iconContainerSize, accentClasses)}>
          <Icon className={iconSize} />
        </div>
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold',
              trendDirection === 'up'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200'
                : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-200'
            )}
          >
            {trendDirection === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className={cn("font-bold uppercase text-surface-400 dark:text-slate-500", labelSize)}>{label}</p>
          <p className={cn("mt-1 font-heading font-black tracking-tight text-surface-950 dark:text-white truncate", valueSize)}>
            <AnimatedValue value={value} formatter={formatter} />
          </p>
          <p className={cn("text-surface-500 dark:text-slate-400 truncate", detailSize)}>{detail}</p>
        </div>
        {miniData.length > 1 && shouldRender && (
          <div className="h-16 w-24 opacity-85 transition group-hover:opacity-100 shrink-0" style={{ minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={miniData} margin={{ top: 6, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`stat-${label.replace(/\s/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.36} />
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke={chartColor} strokeWidth={2.5} fill={`url(#stat-${label.replace(/\s/g, '-')})`} isAnimationActive />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </motion.article>
  )
}
