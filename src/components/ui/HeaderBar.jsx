import React, { useState } from 'react'
import { Bell, Menu, Moon, Search, Sparkles, Sun } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTheme } from '../../contexts/ThemeContext.jsx'
import useNotifications from '../../hooks/useNotifications.js'
import NotificationPanel from './NotificationPanel.jsx'

export default function HeaderBar({ title, subtitle, onMenuClick, actions, userInitials }) {
  const { isDark, toggleTheme } = useTheme()
  const { notifications, unreadCount, markRead, markAllRead, clearAll } = useNotifications()
  const [panelOpen, setPanelOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-white/72 px-4 py-3 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/58 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="grid h-10 w-10 place-items-center rounded-lg border border-surface-200 bg-white text-surface-600 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="hidden h-8 w-8 place-items-center rounded-lg bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200 sm:grid">
                <Sparkles className="h-4 w-4" />
              </span>
              <h1 className="truncate font-heading text-xl font-black tracking-tight text-surface-950 dark:text-white sm:text-2xl">
                {title}
              </h1>
            </div>
            {subtitle && <p className="mt-0.5 hidden truncate text-sm text-surface-500 dark:text-slate-400 sm:block">{subtitle}</p>}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <label className="hidden h-10 items-center gap-2 rounded-lg border border-surface-200 bg-white/80 px-3 text-surface-500 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-400 md:flex">
            <Search className="h-4 w-4" />
            <input
              type="search"
              placeholder="Search farm data"
              className="w-40 bg-transparent text-sm text-surface-800 outline-none placeholder:text-surface-400 dark:text-white dark:placeholder:text-slate-500"
            />
          </label>
          <button
            type="button"
            onClick={toggleTheme}
            className="grid h-10 w-10 place-items-center rounded-lg border border-surface-200 bg-white text-surface-600 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-emerald-200"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          
          <motion.button
            type="button"
            whileHover={{ y: -1 }}
            onClick={() => setPanelOpen((prev) => !prev)}
            className="relative grid h-10 w-10 place-items-center rounded-lg border border-surface-200 bg-white text-surface-600 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-2.5 top-2.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white ring-2 ring-white dark:ring-slate-950">
                {unreadCount}
              </span>
            )}
          </motion.button>

          <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-emerald-500 to-green-800 text-sm font-black text-white shadow-lg shadow-emerald-700/20">
            {userInitials}
          </div>
          {actions}
        </div>
      </div>

      <AnimatePresence>
        {panelOpen && (
          <motion.div
            initial={{ opacity: 0, x: 280 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed inset-y-0 right-0 z-50"
          >
            <NotificationPanel
              notifications={notifications}
              unreadCount={unreadCount}
              markRead={markRead}
              markAllRead={markAllRead}
              clearAll={clearAll}
              onClose={() => setPanelOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

