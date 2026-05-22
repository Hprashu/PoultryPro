import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { cn } from '../../lib/ui'

const toastStyles = {
  success: 'border-emerald-300/70 bg-emerald-600 text-white shadow-emerald-800/25',
  error: 'border-red-300/70 bg-red-600 text-white shadow-red-800/25',
  info: 'border-sky-300/70 bg-sky-600 text-white shadow-sky-800/25',
}

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

export default function Toast({ toast }) {
  const type = toast?.type || 'success'
  const Icon = icons[type] || icons.info

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.96 }}
          className={cn('fixed bottom-5 right-5 z-[70] flex max-w-sm items-center gap-3 rounded-lg border px-4 py-3 text-sm font-bold shadow-2xl backdrop-blur-xl', toastStyles[type])}
        >
          <Icon className="h-5 w-5 shrink-0" />
          <span>{toast.msg}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
