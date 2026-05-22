import React, { createContext, useContext, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { cn } from '../lib/ui.js'

const ToastContext = createContext(null)

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

const toastStyles = {
  success: 'border-emerald-500/20 bg-emerald-500 text-white shadow-emerald-500/10 dark:bg-emerald-600',
  error: 'border-red-500/20 bg-red-500 text-white shadow-red-500/10 dark:bg-red-600',
  info: 'border-sky-500/20 bg-sky-500 text-white shadow-sky-500/10 dark:bg-sky-600',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((msg, type = 'success') => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, msg, type }])
    setTimeout(() => {
      removeToast(id)
    }, 4000)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast: addToast, removeToast }}>
      {children}
      {/* Toast Stack Container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none w-full max-w-sm">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = icons[toast.type] || icons.info
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.95 }}
                layout
                className={cn(
                  'pointer-events-auto flex w-full items-center justify-between gap-3.5 rounded-xl border p-4 text-sm font-black shadow-2xl backdrop-blur-xl transition-all duration-200',
                  toastStyles[toast.type]
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="leading-snug">{toast.msg}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="grid h-6 w-6 place-items-center rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition"
                  aria-label="Close notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
