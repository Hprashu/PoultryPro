import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Bell, Check, Trash2, X, AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react'
import { cn } from '../../lib/ui.js'

const icons = {
  critical: AlertCircle,
  warning: AlertTriangle,
  success: CheckCircle2,
  info: Info,
}

const styles = {
  critical: 'border-red-200 bg-red-500/10 text-red-700 dark:border-red-500/20 dark:text-red-300',
  warning: 'border-amber-200 bg-amber-500/10 text-amber-700 dark:border-amber-500/20 dark:text-amber-300',
  success: 'border-emerald-200 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/20 dark:text-emerald-300',
  info: 'border-sky-200 bg-sky-500/10 text-sky-700 dark:border-sky-500/20 dark:text-sky-300',
}

export default function NotificationPanel({
  notifications,
  unreadCount,
  markRead,
  markAllRead,
  clearAll,
  onClose,
}) {
  const [filter, setFilter] = useState('All')

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (filter === 'All') return true
      if (filter === 'Unread') return !n.read
      if (filter === 'Emergency') return n.type === 'critical'
      return true
    })
  }, [notifications, filter])

  return (
    <div className="fixed inset-y-0 right-0 z-[100] flex w-full max-w-md flex-col border-l border-white/60 bg-white/95 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/95">
      {/* Backdrop for mobile */}
      <div
        className="fixed inset-0 -z-10 bg-slate-950/20 backdrop-blur-xs md:hidden"
        onClick={onClose}
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-surface-100 p-5 dark:border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Bell className="h-5 w-5 text-emerald-500" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </div>
          <h3 className="font-heading text-lg font-black tracking-tight text-surface-950 dark:text-white">
            Activity Alerts
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid h-8 w-8 place-items-center rounded-lg hover:bg-surface-100 dark:hover:bg-white/5 text-surface-400 transition"
          aria-label="Close panel"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-100 px-5 py-3 dark:border-white/5 text-xs font-black uppercase tracking-wider text-surface-500 dark:text-slate-400">
        <div className="flex gap-2">
          {['All', 'Unread', 'Emergency'].map((opt) => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={cn(
                'rounded-md px-2.5 py-1 transition-all',
                filter === opt
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                  : 'hover:text-surface-800 dark:hover:text-white'
              )}
            >
              {opt}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={markAllRead}
            className="flex items-center gap-1 hover:text-emerald-500 transition"
          >
            <Check className="h-3.5 w-3.5" />
            Mark all read
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-1 hover:text-red-500 transition"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear all
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
        {filtered.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center opacity-60 py-20">
            <Bell className="h-10 w-10 text-surface-300 dark:text-slate-600 mb-2" />
            <p className="text-xs font-semibold text-surface-500 dark:text-slate-400">
              No alert notifications found.
            </p>
          </div>
        ) : (
          filtered.map((notification, idx) => {
            const Icon = icons[notification.type] || icons.info
            return (
              <motion.div
                key={notification.id || idx}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.03 }}
                className={cn(
                  'relative flex items-start gap-3 rounded-xl border p-4 shadow-sm backdrop-blur-md transition-all duration-200',
                  styles[notification.type] || styles.info,
                  !notification.read && 'ring-1 ring-emerald-500/30'
                )}
              >
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/70 dark:bg-white/10">
                  <Icon className="h-4.5 w-4.5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="font-black text-[10px] tracking-widest uppercase opacity-60">
                      {notification.category || 'System'}
                    </span>
                    <span className="text-[9px] opacity-60">
                      {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h4 className="font-heading text-xs font-black text-surface-900 dark:text-white mt-0.5">
                    {notification.title}
                  </h4>
                  <p className="mt-1 text-xs opacity-85 leading-relaxed font-medium">
                    {notification.detail}
                  </p>
                </div>

                {!notification.read && (
                  <button
                    type="button"
                    onClick={() => markRead(notification.id)}
                    className="absolute top-3.5 right-3.5 grid h-6 w-6 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition"
                    aria-label="Mark as read"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                )}
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
