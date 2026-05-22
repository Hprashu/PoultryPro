import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/ui'

export default function BrandMark({ collapsed = false, dark = false, className = '' }) {
  return (
    <div className={cn('flex items-center gap-3 min-w-0', className)}>
      <motion.div
        layout
        className={cn(
          'relative grid h-11 w-11 shrink-0 place-items-center rounded-lg border shadow-lg transition-all duration-300',
          dark
            ? 'border-white/10 bg-white/5 shadow-emerald-950/20'
            : 'border-emerald-100 bg-white shadow-emerald-600/5 hover:border-emerald-300'
        )}
      >
        <img src="/logo-icon.png" alt="PoultryPro Logo" className="h-8 w-8 object-contain" />
      </motion.div>

      {!collapsed && (
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          className="min-w-0"
        >
          <p className="font-heading text-lg font-black leading-tight tracking-tight">
            <span className="text-emerald-600 dark:text-emerald-400">Poultry</span>
            <span className="text-amber-500 dark:text-amber-400 font-extrabold">Pro</span>
          </p>
          <p className={cn('text-[9px] font-black uppercase tracking-[0.22em]', dark ? 'text-emerald-100/60' : 'text-emerald-700/80 dark:text-emerald-200/60')}>
            Smart Farm Management
          </p>
        </motion.div>
      )}
    </div>
  )
}
