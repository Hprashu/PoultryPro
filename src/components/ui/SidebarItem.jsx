import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/ui'

export default function SidebarItem({ icon: Icon, label, active, collapsed, disabled, onClick, badge }) {
  return (
    <motion.button
      type="button"
      layout
      whileHover={disabled ? undefined : { x: collapsed ? 0 : 4 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      onClick={disabled ? undefined : onClick}
      aria-current={active ? 'page' : undefined}
      title={collapsed ? label : undefined}
      className={cn(
        'group relative flex w-full items-center gap-3 overflow-hidden rounded-xl px-3 py-3 text-left text-sm font-semibold transition-all duration-300',
        collapsed ? 'justify-center px-2' : 'px-4',
        active
          ? 'text-emerald-950 dark:text-emerald-100 font-extrabold'
          : 'text-surface-500 hover:text-surface-900 dark:text-slate-400 dark:hover:text-white',
        disabled && 'cursor-not-allowed opacity-45'
      )}
    >
      {/* Animated active indicator */}
      {active && (
        <motion.span
          layoutId="active-sidebar-item"
          className="absolute inset-0 rounded-xl border border-emerald-300/40 bg-gradient-to-r from-emerald-500/10 to-emerald-500/20 shadow-[0_4px_20px_rgba(16,185,129,0.12)] dark:border-emerald-400/20 dark:bg-gradient-to-r dark:from-emerald-500/10 dark:to-emerald-500/5"
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}
      
      {/* Active Left Vertical Border bar */}
      {active && (
        <motion.span
          layoutId="active-sidebar-bar"
          className="absolute left-0 top-3 bottom-3 w-1 rounded-r-md bg-emerald-500 shadow-[0_0_10px_#10b981]"
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}

      {/* Hover glow background effect */}
      <span className="absolute inset-0 -z-10 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Icon container with border & glow */}
      <span
        className={cn(
          'relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition-all duration-300',
          active
            ? 'border-emerald-300/60 bg-emerald-50 text-emerald-700 shadow-sm dark:border-emerald-400/30 dark:bg-emerald-500/15 dark:text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
            : 'border-surface-200/50 bg-white/40 text-surface-400 dark:border-white/5 dark:bg-white/5 dark:text-slate-400 group-hover:border-emerald-400/40 group-hover:bg-white group-hover:text-emerald-600 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] dark:group-hover:bg-emerald-500/10 dark:group-hover:text-emerald-400'
        )}
      >
        <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
      </span>

      {/* Label and Badge elements */}
      {!collapsed && (
        <div className="relative z-10 flex flex-1 items-center justify-between min-w-0">
          <span className="truncate tracking-wide transition-colors duration-300">{label}</span>
          
          {/* Badge indicator */}
          <AnimatePresence>
            {badge !== undefined && badge > 0 && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className={cn(
                  "flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-black text-white shadow-sm ring-2 ring-white dark:ring-slate-900",
                  badge > 5 ? "bg-red-500 animate-pulse shadow-red-500/20" : "bg-emerald-500 shadow-emerald-500/20"
                )}
              >
                {badge}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Tooltip or small badge overlay for collapsed state */}
      {collapsed && badge !== undefined && badge > 0 && (
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-1 ring-white dark:ring-slate-900" />
      )}
    </motion.button>
  )
}
