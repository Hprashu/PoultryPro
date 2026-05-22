import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Image as ImageIcon,
  Trash2,
  Cpu,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  X,
  Maximize2,
  Eye,
  FileText,
  AlertCircle,
  HelpCircle,
  Clock,
  ChevronRight
} from 'lucide-react'
import AppShell from '../components/ui/AppShell.jsx'
import ImageDropZone from '../components/ui/ImageDropZone.jsx'
import useRealtimeCollection from '../hooks/useRealtimeCollection.js'
import useRealtimePoultry from '../hooks/useRealtimePoultry.js'
import useImageUpload from '../hooks/useImageUpload.js'
import { COLLECTIONS, deleteDocument, updateDocument } from '../firebase'
import { deleteImage } from '../firebase/storageService.js'
import { useToast } from '../contexts/ToastContext.jsx'
import { cn } from '../lib/ui'

export default function ImageGallery() {
  const { addToast } = useToast()
  
  // Realtime subscription for images
  const { data: images, setData: setImages, loading: imagesLoading, error: imagesError, isOffline } = useRealtimeCollection(
    COLLECTIONS.images,
    []
  )

  // Realtime flocks for linking
  const { records: flocks, loading: flocksLoading } = useRealtimePoultry()

  // Image Upload Hook
  const { upload, progress, uploading, error: uploadError } = useImageUpload()

  // UI state
  const [selectedFlockFilter, setSelectedFlockFilter] = useState('all')
  const [targetFlockId, setTargetFlockId] = useState('general')
  const [activeImage, setActiveImage] = useState(null)
  const [scanningId, setScanningId] = useState(null)

  // Format file size
  const formatSize = (bytes) => {
    if (!bytes) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Handle uploading files
  const handleFileSelect = async (file) => {
    try {
      const downloadUrl = await upload(file, targetFlockId, isOffline)
      
      // If we are offline or running in mock local fallback mode, sync local records
      if (isOffline || downloadUrl.startsWith('blob:')) {
        const cached = window.localStorage.getItem('poultrypro_images')
        const currentLocal = cached ? JSON.parse(cached) : []
        setImages(currentLocal)
      }
      
      addToast('success', 'Biosecurity image registered successfully.')
    } catch (err) {
      addToast('error', `Failed to upload image: ${err.message}`)
    }
  }

  // Handle image deletion
  const handleDelete = async (image, e) => {
    if (e) e.stopPropagation()
    
    const confirmDelete = window.confirm('Are you sure you want to delete this biosecurity photo?')
    if (!confirmDelete) return

    try {
      if (image.id.startsWith('local-img-')) {
        const cached = window.localStorage.getItem('poultrypro_images')
        if (cached) {
          const currentLocal = JSON.parse(cached)
          const updated = currentLocal.filter((img) => img.id !== image.id)
          window.localStorage.setItem('poultrypro_images', JSON.stringify(updated))
          setImages(updated)
        }
      } else {
        await deleteDocument(COLLECTIONS.images, image.id)
        await deleteImage(image.url)
      }
      
      if (activeImage?.id === image.id) {
        setActiveImage(null)
      }

      addToast('success', 'Image removed from registry.')
    } catch (err) {
      addToast('error', `Failed to delete image: ${err.message}`)
    }
  }

  // Handle simulated AI scan
  const handleAIScan = async (image, e) => {
    if (e) e.stopPropagation()
    
    setScanningId(image.id)
    
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000))
    
    // Mock analysis responses
    const mockDiagnostics = [
      {
        status: 'Compliant',
        score: 96,
        litter: 'Dry, optimal quality (12% moisture)',
        activity: 'Normal flock distribution, no crowding detected',
        feeders: 'Adequate feed levels, clear access pathways',
        recommendations: 'No actions required. Litter and feeders are highly compliant.'
      },
      {
        status: 'Compliant',
        score: 91,
        litter: 'Dry, general cleanliness compliant',
        activity: 'Slight crowd cluster in corner (watch temperature)',
        feeders: 'Adequate feed levels',
        recommendations: 'Monitor cluster zone; adjust ventilation if clustering persists.'
      },
      {
        status: 'Warning',
        score: 74,
        litter: 'Damp zones identified near water lines (possible leak)',
        activity: 'Slightly clustered pattern around feed lines',
        feeders: 'Low feed levels detected in line 3',
        recommendations: 'Inspect water valve seals in zone 2. Refill feed line 3 immediately.'
      }
    ]

    // Select randomly but consistently based on image ID/name
    const index = Math.abs(image.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % mockDiagnostics.length
    const aiResults = {
      ...mockDiagnostics[index],
      scannedAt: new Date().toISOString()
    }

    try {
      if (image.id.startsWith('local-img-')) {
        const cached = window.localStorage.getItem('poultrypro_images')
        if (cached) {
          const currentLocal = JSON.parse(cached)
          const updated = currentLocal.map((img) => {
            if (img.id === image.id) {
              return { ...img, aiResults }
            }
            return img
          })
          window.localStorage.setItem('poultrypro_images', JSON.stringify(updated))
          setImages(updated)
          // Update active image if open
          if (activeImage?.id === image.id) {
            setActiveImage({ ...activeImage, aiResults })
          }
        }
      } else {
        await updateDocument(COLLECTIONS.images, image.id, { aiResults })
      }
      
      addToast('success', 'AI Diagnostics successfully completed.')
    } catch (err) {
      addToast('error', `AI Analysis failed: ${err.message}`)
    } finally {
      setScanningId(null)
    }
  }

  // Filter images based on selected flock filter
  const filteredImages = useMemo(() => {
    if (!images) return []
    if (selectedFlockFilter === 'all') return images
    return images.filter((img) => img.flockId === selectedFlockFilter)
  }, [images, selectedFlockFilter])

  return (
    <AppShell title="Biosecurity & AI Gallery" subtitle="Upload flock health photos and trigger neural-net vision diagnostics">
      
      {/* Offline Banner */}
      {isOffline && (
        <div className="flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-800 dark:border-amber-500/20 dark:text-amber-200">
          <AlertTriangle className="h-4.5 w-4.5 text-amber-500 shrink-0" />
          <span>Local storage fallback active. Images uploaded will use local binary cache.</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Upload & Controls Panel */}
        <div className="lg:col-span-1 space-y-5">
          <div className="rounded-xl border border-white/70 bg-white/82 p-5 shadow-xl shadow-emerald-950/[0.03] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055]">
            <h3 className="font-heading text-base font-black tracking-tight text-surface-950 dark:text-white flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-emerald-500" />
              Register Image
            </h3>
            <p className="text-xs text-surface-500 dark:text-slate-400 mt-1 mb-4">
              Link telemetry photos to specific flocks for automated diagnostics.
            </p>

            {/* Flock Selector */}
            <div className="mb-4">
              <label htmlFor="flock-link-select" className="mb-1.5 block text-xs font-bold text-surface-700 dark:text-slate-300">
                Link to Flock
              </label>
              <select
                id="flock-link-select"
                value={targetFlockId}
                onChange={(e) => setTargetFlockId(e.target.value)}
                className="w-full h-10 rounded-lg border border-surface-200 bg-white px-3 text-xs font-semibold text-surface-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-white/10 dark:bg-slate-950 dark:text-white"
              >
                <option value="general">General (Unlinked)</option>
                {flocks.map((f) => (
                  <option key={f.id} value={f.id}>
                    Flock #{f.id.slice(-4).toUpperCase()} ({f.breed} — {f.birdCount} birds)
                  </option>
                ))}
              </select>
            </div>

            {/* Upload Zone */}
            <ImageDropZone
              onFileSelect={handleFileSelect}
              uploading={uploading}
              progress={progress}
              error={uploadError}
            />
          </div>

          {/* Quick Stats Panel */}
          <div className="rounded-xl border border-white/70 bg-white/82 p-5 shadow-xl shadow-emerald-950/[0.03] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055]">
            <h3 className="font-heading text-sm font-black tracking-tight text-surface-950 dark:text-white mb-3">
              Biosecurity Diagnostics Registry
            </h3>
            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-surface-500 dark:text-slate-400">Total Registered Photos</span>
                <span className="text-surface-950 dark:text-white font-black">{images.length}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-surface-500 dark:text-slate-400">AI Diagnosed</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-black">
                  {images.filter((img) => img.aiResults).length} / {images.length}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-surface-500 dark:text-slate-400">Warnings Raised</span>
                <span className={cn(
                  "font-black",
                  images.filter((img) => img.aiResults?.status === 'Warning').length > 0 
                    ? "text-amber-600 dark:text-amber-400" 
                    : "text-surface-500 dark:text-slate-400"
                )}>
                  {images.filter((img) => img.aiResults?.status === 'Warning').length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Grid Panel */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-xl border border-white/70 bg-white/82 p-5 shadow-xl shadow-emerald-950/[0.03] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055] min-h-[400px]">
            {/* Gallery Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-100 pb-4 dark:border-white/5 mb-5">
              <div>
                <h3 className="font-heading text-base font-black tracking-tight text-surface-950 dark:text-white">
                  Biosecurity Records
                </h3>
                <p className="text-xs text-surface-500 dark:text-slate-400">
                  Visual history of flock pens and health scans
                </p>
              </div>

              {/* Flock Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-surface-500 dark:text-slate-400">Filter:</span>
                <select
                  id="flock-filter-select"
                  value={selectedFlockFilter}
                  onChange={(e) => setSelectedFlockFilter(e.target.value)}
                  className="h-9 rounded-lg border border-surface-200 bg-white px-2.5 text-xs font-semibold text-surface-900 outline-none transition focus:border-emerald-500 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                >
                  <option value="all">All Flocks</option>
                  <option value="general">General (Unlinked)</option>
                  {flocks.map((f) => (
                    <option key={f.id} value={f.id}>
                      Flock #{f.id.slice(-4).toUpperCase()} ({f.breed})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Gallery Grid */}
            {imagesLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-[4/3] rounded-xl skeleton" />
                ))}
              </div>
            ) : filteredImages.length === 0 ? (
              <div className="flex h-80 flex-col items-center justify-center text-center opacity-65">
                <ImageIcon className="h-12 w-12 text-surface-400 mb-3" />
                <p className="text-sm font-semibold text-surface-700 dark:text-slate-300">No biosecurity images found</p>
                <p className="text-xs text-surface-500 dark:text-slate-500 mt-1 max-w-[280px]">
                  {selectedFlockFilter !== 'all' 
                    ? 'No images linked to this flock. Select another filter or upload a new photo.'
                    : 'Drag & drop a JPG or PNG above to store pen conditions in the registry.'}
                </p>
              </div>
            ) : (
              <motion.div 
                layout
                className="grid grid-cols-1 gap-4 sm:grid-cols-2"
              >
                <AnimatePresence mode="popLayout">
                  {filteredImages.map((image) => {
                    const isScanning = scanningId === image.id
                    const displayFlock = image.flockId === 'general' 
                      ? 'Unlinked' 
                      : `Flock #${image.flockId.slice(-4).toUpperCase()}`

                    return (
                      <motion.div
                        layout
                        key={image.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        whileHover={{ y: -3 }}
                        onClick={() => setActiveImage(image)}
                        className={cn(
                          "group relative overflow-hidden rounded-xl border bg-white/70 shadow-sm backdrop-blur-md transition-all cursor-pointer dark:bg-white/[0.02]",
                          image.aiResults?.status === 'Warning' 
                            ? "border-amber-500/30 hover:border-amber-500/50" 
                            : "border-white/75 hover:border-emerald-500/40 dark:border-white/10 dark:hover:border-emerald-500/40",
                          isScanning && "ring-2 ring-emerald-500/80 animate-pulse"
                        )}
                      >
                        {/* Image Preview Window */}
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900/10 dark:bg-slate-950/40">
                          <img
                            src={image.url}
                            alt={image.name}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 transition duration-300 group-hover:opacity-80" />

                          {/* Top-Right Badges */}
                          <div className="absolute right-3 top-3 flex flex-col gap-1.5 items-end">
                            {/* AI Result Status Badge */}
                            {image.aiResults ? (
                              <span className={cn(
                                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-sm backdrop-blur-md",
                                image.aiResults.status === 'Compliant'
                                  ? "bg-emerald-500/90 text-white"
                                  : "bg-amber-500/90 text-white"
                              )}>
                                {image.aiResults.status === 'Compliant' ? (
                                  <CheckCircle2 className="h-3 w-3" />
                                ) : (
                                  <AlertTriangle className="h-3 w-3" />
                                )}
                                AI Score: {image.aiResults.score}%
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/70 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-300 shadow-sm backdrop-blur-md">
                                <Cpu className="h-3 w-3 text-slate-400" />
                                Unscanned
                              </span>
                            )}
                          </div>

                          {/* Hover action overlay icons */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-emerald-950/30">
                              <Eye className="h-3.5 w-3.5" />
                              View Details
                            </span>
                          </div>
                        </div>

                        {/* Text Metadata Area */}
                        <div className="p-3.5">
                          <h4 className="truncate text-xs font-bold text-surface-900 dark:text-white" title={image.name}>
                            {image.name}
                          </h4>
                          <div className="mt-2.5 flex flex-wrap items-center gap-y-1.5 gap-x-3 text-[10px] font-semibold text-surface-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <Layers className="h-3.5 w-3.5 text-emerald-500" />
                              {displayFlock}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {new Date(image.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Footer Operations */}
                          <div className="mt-3 flex items-center justify-between gap-2 border-t border-surface-100 pt-2.5 dark:border-white/5">
                            {/* Scanning indicator / AI Action */}
                            {isScanning ? (
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-500">
                                <Cpu className="h-3 w-3 animate-spin" />
                                AI Scanning...
                              </span>
                            ) : !image.aiResults ? (
                              <button
                                type="button"
                                onClick={(e) => handleAIScan(image, e)}
                                className="inline-flex h-7 items-center gap-1 rounded bg-emerald-500 px-2 text-[10px] font-black uppercase tracking-wider text-white hover:bg-emerald-600 transition"
                              >
                                <Sparkles className="h-3 w-3" />
                                Run AI Diagnostic
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => handleAIScan(image, e)}
                                className="inline-flex h-7 items-center gap-1 rounded border border-surface-200 dark:border-white/10 px-2 text-[10px] font-bold text-surface-600 dark:text-slate-300 hover:bg-surface-50 dark:hover:bg-white/5 transition"
                              >
                                <Sparkles className="h-3 w-3" />
                                Re-Scan Pen
                              </button>
                            )}

                            <button
                              id={`delete-btn-${image.id}`}
                              type="button"
                              onClick={(e) => handleDelete(image, e)}
                              className="grid h-7 w-7 place-items-center rounded text-surface-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 transition"
                              title="Delete Photo"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox / Details Modal */}
      <AnimatePresence>
        {activeImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Modal Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveImage(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal Content Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 flex h-[85vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-slate-900 text-white shadow-2xl flex-col md:flex-row"
            >
              {/* Left Side: Large Image */}
              <div className="relative flex-1 bg-slate-950 flex items-center justify-center p-2 min-h-[40vh] md:min-h-0">
                <img
                  src={activeImage.url}
                  alt={activeImage.name}
                  className="h-full w-full object-contain"
                />
                
                {/* Close Button on Mobile overlay */}
                <button
                  type="button"
                  onClick={() => setActiveImage(null)}
                  className="absolute left-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-white transition md:hidden"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Right Side: Biosecurity Diagnostics Report */}
              <div className="w-full md:w-[400px] border-t md:border-t-0 md:border-l border-white/10 bg-slate-900/95 backdrop-blur-lg flex flex-col h-full max-h-[45vh] md:max-h-none">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-white/5 p-4 shrink-0">
                  <div>
                    <h3 className="font-heading text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-emerald-400" />
                      Biosecurity Profile
                    </h3>
                    <p className="text-[10px] text-slate-400 font-semibold truncate max-w-[280px]">
                      {activeImage.name}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveImage(null)}
                    className="hidden md:grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-white transition"
                    aria-label="Close modal"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Modal Body / Scroll Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-5">
                  
                  {/* File Metadata Info */}
                  <div className="grid grid-cols-2 gap-3.5 rounded-xl bg-white/5 p-3.5 text-xs font-semibold text-slate-300">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Flock Linked</span>
                      <span className="font-black text-white flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        {activeImage.flockId === 'general' ? 'Unlinked' : `Flock #${activeImage.flockId.slice(-4).toUpperCase()}`}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 block">File Size</span>
                      <span className="font-black text-white">{formatSize(activeImage.size)}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Uploaded On</span>
                      <span className="font-black text-white flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        {new Date(activeImage.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Registry Status</span>
                      <span className="font-black text-emerald-400">Synced</span>
                    </div>
                  </div>

                  {/* AI Diagnosis Details */}
                  <div className="space-y-3">
                    <h4 className="font-heading text-xs font-black uppercase tracking-wider text-slate-400">
                      Vision Intelligence Diagnosis
                    </h4>

                    {scanningId === activeImage.id ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
                        <Cpu className="h-8 w-8 text-emerald-400 animate-spin" />
                        <div>
                          <p className="text-xs font-black text-white">Running Neural-Net Scan...</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Analyzing litter dampness and crop feeder patterns</p>
                        </div>
                      </div>
                    ) : activeImage.aiResults ? (
                      <div className="space-y-3.5">
                        {/* Overall AI Score and Status */}
                        <div className={cn(
                          "rounded-xl border p-3.5 flex items-center justify-between shadow-sm",
                          activeImage.aiResults.status === 'Compliant'
                            ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-200"
                            : "border-amber-500/30 bg-amber-500/5 text-amber-200"
                        )}>
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Verdict</span>
                            <p className="font-heading text-sm font-black flex items-center gap-1">
                              {activeImage.aiResults.status === 'Compliant' ? (
                                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
                              ) : (
                                <AlertTriangle className="h-4.5 w-4.5 text-amber-400" />
                              )}
                              {activeImage.aiResults.status}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Confidence</span>
                            <p className="font-heading text-lg font-black text-white">{activeImage.aiResults.score}%</p>
                          </div>
                        </div>

                        {/* Breakdown Metrics */}
                        <div className="space-y-3 rounded-xl bg-white/[0.03] p-3.5 text-xs font-semibold">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Litter Health</span>
                            <p className="text-slate-200">{activeImage.aiResults.litter}</p>
                          </div>
                          <div className="space-y-1 border-t border-white/5 pt-2">
                            <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Feed Line & Water Access</span>
                            <p className="text-slate-200">{activeImage.aiResults.feeders}</p>
                          </div>
                          <div className="space-y-1 border-t border-white/5 pt-2">
                            <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Animal Activity Density</span>
                            <p className="text-slate-200">{activeImage.aiResults.activity}</p>
                          </div>
                        </div>

                        {/* Suggestions / Recommendations */}
                        <div className="rounded-xl border border-white/5 bg-white/5 p-3.5 text-xs font-semibold">
                          <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1">AI Recommendation</span>
                          <p className="text-slate-300 leading-relaxed">{activeImage.aiResults.recommendations}</p>
                        </div>

                        <div className="text-[9px] text-slate-500 font-medium flex items-center gap-1 justify-end">
                          <Clock className="h-3 w-3" />
                          Diagnosed: {new Date(activeImage.aiResults.scannedAt).toLocaleTimeString()}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-white/10 p-5 text-center flex flex-col items-center justify-center gap-3">
                        <Cpu className="h-8 w-8 text-slate-500" />
                        <div>
                          <p className="text-xs font-bold text-slate-300">Pen visual has not been analyzed</p>
                          <p className="text-[10px] text-slate-500 mt-1 max-w-[200px] mx-auto">Run the AI decision scan to diagnose litter status and bird activity.</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleAIScan(activeImage, e)}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-500 px-3 text-xs font-black uppercase tracking-wider text-white hover:bg-emerald-600 transition mt-1"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          Analyze Image Now
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="border-t border-white/5 p-3 flex justify-between items-center bg-slate-950/20 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => handleDelete(activeImage, e)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-black uppercase tracking-wider text-red-400 hover:bg-red-500/10 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete From Registry
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImage(null)}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 px-4 text-xs font-black uppercase tracking-wider text-slate-300 hover:bg-white/10 transition"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </AppShell>
  )
}
