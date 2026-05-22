import React, { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { UploadCloud, Image as ImageIcon, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '../../lib/ui.js'

export default function ImageDropZone({ onFileSelect, uploading, progress, error }) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [localError, setLocalError] = useState(null)

  const processFile = useCallback((file) => {
    setLocalError(null)
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      setLocalError('Invalid file type. Please upload a JPEG, PNG, WEBP, or GIF image.')
      return
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setLocalError('File size exceeds the 5MB biosecurity image limit.')
      return
    }

    onFileSelect(file)
  }, [onFileSelect])

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true)
    } else if (e.type === 'dragleave') {
      setIsDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0])
    }
  }

  const displayError = error || localError

  return (
    <div className="w-full">
      <motion.div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        whileHover={{ scale: uploading ? 1 : 1.005 }}
        className={cn(
          'relative flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center transition-all duration-300',
          isDragActive
            ? 'border-emerald-500 bg-emerald-500/5'
            : 'border-surface-200 bg-white/20 hover:border-emerald-500/50 hover:bg-white/30 dark:border-white/10 dark:bg-white/[0.02]',
          uploading && 'pointer-events-none opacity-60'
        )}
      >
        <input
          id="image-file-input"
          type="file"
          accept="image/*"
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={handleFileInput}
          disabled={uploading}
        />

        {uploading ? (
          <div className="space-y-4">
            <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 dark:text-emerald-300">
              <Loader2 className="h-7 w-7 animate-spin" />
            </div>
            <div>
              <p className="font-heading text-sm font-black text-surface-950 dark:text-white">
                Uploading to Farm Registry...
              </p>
              <p className="mt-1 text-xs text-surface-500 dark:text-slate-400">
                Verifying secure biosecurity metadata: {progress}%
              </p>
            </div>
            <div className="mx-auto h-1.5 w-48 overflow-hidden rounded-full bg-surface-100 dark:bg-white/5">
              <motion.div
                className="h-full bg-emerald-500 shadow-sm"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <UploadCloud className="h-6 w-6" />
            </div>
            <div>
              <p className="font-heading text-sm font-black text-surface-950 dark:text-white">
                Drag and drop farm image here
              </p>
              <p className="mt-1 text-xs text-surface-400 dark:text-slate-500">
                Supports JPG, PNG, WEBP, or GIF (max 5MB)
              </p>
            </div>
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-surface-200 bg-white px-4 text-xs font-black uppercase tracking-wider text-surface-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
            >
              Browse Files
            </button>
          </div>
        )}
      </motion.div>

      {displayError && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3.5 py-2.5 text-xs font-semibold text-red-700 dark:text-red-300"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <span>{displayError}</span>
        </motion.div>
      )}
    </div>
  )
}
