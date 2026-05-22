import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Camera,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  FileText,
  ShieldAlert,
  ListFilter,
  Volume2,
  VolumeX,
  Phone
} from 'lucide-react'
import AppShell from '../components/ui/AppShell.jsx'
import ImageDropZone from '../components/ui/ImageDropZone.jsx'
import { useToast } from '../contexts/ToastContext.jsx'
import { useVoice } from '../hooks/useVoice'
import { cn } from '../lib/ui'

// Mock symptoms list
const SYMPTOMS_LIST = [
  { id: 'symp-1', name: 'Bloody Diarrhea / Loose Stools', diseaseWeight: { coccidiosis: 45, coryza: 5, healthy: -20 } },
  { id: 'symp-2', name: 'Extreme Lethargy & Drooping Wings', diseaseWeight: { coccidiosis: 30, coryza: 15, healthy: -40 } },
  { id: 'symp-3', name: 'Swollen Head, Comb, or Wattles', diseaseWeight: { coccidiosis: 0, coryza: 55, healthy: -30 } },
  { id: 'symp-4', name: 'Respiratory Snicking or Coughing', diseaseWeight: { coccidiosis: 0, coryza: 40, healthy: -20 } },
  { id: 'symp-5', name: 'Ruffled Feathers & Huddling', diseaseWeight: { coccidiosis: 25, coryza: 20, healthy: -20 } },
  { id: 'symp-6', name: 'Significant Drop in Feed/Water Intake', diseaseWeight: { coccidiosis: 20, coryza: 25, healthy: -30 } },
]

// Initial diagnostic scan history
const INITIAL_HISTORY = [
  {
    id: 'scan-1',
    date: '2026-05-20 09:34 AM',
    condition: 'Coccidiosis Outbreak',
    confidence: '92.4%',
    severity: 'critical',
    status: 'Treated (Amprolium)',
    imgUrl: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'scan-2',
    date: '2026-05-18 02:15 PM',
    condition: 'Healthy / No Pathogens',
    confidence: '98.5%',
    severity: 'normal',
    status: 'Closed',
    imgUrl: 'https://images.unsplash.com/photo-1604848698030-c434ba08eca1?auto=format&fit=crop&q=80&w=300'
  }
]

export default function AIDiseaseScanner() {
  const { t, i18n } = useTranslation()
  const { showToast } = useToast()
  const { speak, isSpeaking, cancelSpeak } = useVoice()
  
  // DropZone/File states
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Camera states
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraStream, setCameraStream] = useState(null)
  const videoRef = useRef(null)

  // Scanning stages
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)

  // Symptoms Selection
  const [selectedSymptoms, setSelectedSymptoms] = useState([])

  // History state
  const [history, setHistory] = useState(INITIAL_HISTORY)

  // TensorFlow.js integration placeholder check
  useEffect(() => {
    // Structured hook placeholder ready to load local or cloud models
    const loadTFModel = async () => {
      console.log("TensorFlow.js detection engine ready. Call loadLayersModel('/models/disease_classifier/model.json') on production run.");
    };
    loadTFModel();
  }, []);

  // Camera management
  const startCamera = async () => {
    setPreviewUrl(null)
    setScanResult(null)
    setCameraActive(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 640, height: 480 }
      })
      setCameraStream(stream)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error("Camera access failed: ", err)
      showToast("Could not access camera. Please check permissions.", "error")
      setCameraActive(false)
    }
  }

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
    setCameraActive(false)
  }

  const capturePhoto = () => {
    if (!videoRef.current) return
    
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth || 640
    canvas.height = videoRef.current.videoHeight || 480
    const ctx = canvas.getContext('2d')
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
    
    const dataUrl = canvas.toDataURL('image/jpeg')
    setPreviewUrl(dataUrl)
    stopCamera()
    showToast("Photo captured successfully!", "success")
  }

  // Handle file select
  const handleFileSelect = (file) => {
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setUploading(true)
    setUploadProgress(0)

    // Simulate metadata registration
    const timer = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer)
          setUploading(false)
          showToast('Image registered with farm biosecurity registry.', 'success')
          return 100
        }
        return prev + 20
      })
    }, 300)
  }

  // Toggle symptom select
  const handleToggleSymptom = (id) => {
    setSelectedSymptoms(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  // Run AI Scan Diagnosis Simulation
  const handleRunScan = () => {
    if (!previewUrl) return
    setScanning(true)
    setScanResult(null)

    // Simulate scanning delay
    setTimeout(() => {
      // Calculate scores based on selected symptoms
      let coccidiosisScore = 10
      let coryzaScore = 5
      let healthyScore = 80

      selectedSymptoms.forEach(sympId => {
        const item = SYMPTOMS_LIST.find(s => s.id === sympId)
        if (item) {
          coccidiosisScore += item.diseaseWeight.coccidiosis
          coryzaScore += item.diseaseWeight.coryza
          healthyScore += item.diseaseWeight.healthy
        }
      })

      // Normalize & cap
      const sum = Math.max(1, coccidiosisScore + coryzaScore + Math.max(0, healthyScore))
      const coccPercent = Math.min(99, Math.max(0, Math.round((coccidiosisScore / sum) * 100)))
      const coryzaPercent = Math.min(99, Math.max(0, Math.round((coryzaScore / sum) * 100)))
      const healthyPercent = Math.min(99, Math.max(0, 100 - coccPercent - coryzaPercent))

      let finalCondition = 'Healthy / No Pathogens'
      let finalConfidence = healthyPercent
      let finalSeverity = 'normal'
      let recommendations = 'Biosecurity check shows no visible signs of systemic disease. Continue regular sanitation, monitoring feed consumption indexes, and scheduling vaccinations.'

      if (coccPercent > coryzaPercent && coccPercent > healthyPercent) {
        finalCondition = 'Coccidiosis / Enteritis'
        finalConfidence = coccPercent
        finalSeverity = 'critical'
        recommendations = 'Isolate infected flock segment instantly. Administer Amprolium (9.6% solution) in drinking water lines for 3-5 days. Ensure litter is fully dry and replace soiled bedding.'
      } else if (coryzaPercent > coccPercent && coryzaPercent > healthyPercent) {
        finalCondition = 'Infectious Coryza'
        finalConfidence = coryzaPercent
        finalSeverity = 'warning'
        recommendations = 'Isolate birds displaying swelling. Treat with approved water-soluble antibiotics (e.g. erythromycin or tetracyclines). Ensure ventilation throughput is high to eliminate particulate dust.'
      }

      const result = {
        condition: finalCondition,
        confidence: `${finalConfidence}%`,
        severity: finalSeverity,
        recommendations,
      }

      setScanResult(result)
      setScanning(false)
      showToast('Scan diagnostics complete!', 'success')

      // Add to history
      setHistory(prev => [
        {
          id: `scan-${Date.now()}`,
          date: new Date().toLocaleString(),
          condition: finalCondition,
          confidence: `${finalConfidence}%`,
          severity: finalSeverity,
          status: t('scanner.awaiting_action'),
          imgUrl: previewUrl
        },
        ...prev
      ])
    }, 3000)
  }

  // Reset scan workbench
  const handleResetScanner = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setScanResult(null)
    setSelectedSymptoms([])
    cancelSpeak()
  }

  // Speech Readout of Diagnostic results
  const triggerAudioReadout = () => {
    if (!scanResult) return
    if (isSpeaking) {
      cancelSpeak()
    } else {
      const diagnosisText = `${t('scanner.condition_detected')}: ${scanResult.condition}. ${t('scanner.confidence')}: ${scanResult.confidence}. ${t('scanner.recommendation')}: ${scanResult.recommendations}`
      speak(diagnosisText)
    }
  }

  // Calculate simulated bounding box coordinates based on condition
  const boundingBoxes = useMemo(() => {
    if (!scanResult) return []
    if (scanResult.condition.includes('Coccidiosis')) {
      return [{ x: '25%', y: '35%', w: '40%', h: '35%', label: 'Abnormal Excreta (Coccidiosis Marker)' }]
    } else if (scanResult.condition.includes('Coryza')) {
      return [{ x: '20%', y: '15%', w: '50%', h: '45%', label: 'Facial Swelling / Coryza Indication' }]
    } else {
      return [{ x: '30%', y: '20%', w: '40%', h: '55%', label: 'Physiologically Normal' }]
    }
  }, [scanResult])

  return (
    <AppShell title={t('scanner.title')} subtitle={t('scanner.subtitle')}>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Workbench Panel (Scanner + Symptoms) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Scanner workbench */}
          <div className="rounded-2xl border border-white/70 bg-white/70 p-6 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055]">
            <h3 className="font-heading text-base font-black tracking-tight text-surface-950 dark:text-white flex items-center gap-2">
              <Camera className="h-5 w-5 text-emerald-500" />
              {t('scanner.title')}
            </h3>
            <p className="text-xs text-surface-500 dark:text-slate-400 mt-0.5 mb-5">
              Upload images or use camera to analyze bird symptoms & biosecurity markers.
            </p>

            {cameraActive ? (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden border border-surface-200/50 dark:border-white/10 aspect-video max-h-[320px] bg-slate-950 flex items-center justify-center">
                  <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover" />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={stopCamera}
                    className="flex-1 h-10 rounded-xl border border-red-200 text-red-655 hover:bg-red-50 dark:border-red-500/20 dark:text-red-400 dark:hover:bg-red-500/10 transition text-xs font-extrabold"
                  >
                    {t('scanner.camera_close')}
                  </button>
                  <button
                    onClick={capturePhoto}
                    className="flex-1 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg transition flex items-center justify-center gap-1.5"
                  >
                    <Camera className="h-4 w-4" />
                    {t('scanner.camera_capture')}
                  </button>
                </div>
              </div>
            ) : !previewUrl ? (
              <div className="space-y-4">
                <ImageDropZone
                  onFileSelect={handleFileSelect}
                  uploading={uploading}
                  progress={uploadProgress}
                />
                
                <button
                  type="button"
                  onClick={startCamera}
                  className="w-full h-12 rounded-xl border border-dashed border-emerald-500/50 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-xs flex items-center justify-center gap-2 transition"
                >
                  <Camera className="h-5 w-5" />
                  {t('scanner.camera_btn')}
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Active scan image preview panel */}
                <div className="relative rounded-xl overflow-hidden border border-surface-200/50 dark:border-white/10 aspect-video max-h-[320px] bg-slate-950 flex items-center justify-center">
                  <img src={previewUrl} alt="Scan preview" className="object-contain h-full w-full" />
                  
                  {scanning && (
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white z-10">
                      <div className="relative h-14 w-14 mb-3">
                        <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20" />
                        <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
                      </div>
                      <p className="text-xs font-black uppercase tracking-wider animate-pulse">Running Neural Analytics...</p>
                    </div>
                  )}

                  {/* Bounding Box Visual Overlay */}
                  {!scanning && scanResult && boundingBoxes.map((box, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "absolute border-2 rounded animate-pulse pointer-events-none flex flex-col justify-between",
                        scanResult.severity === 'critical' ? "border-red-500 bg-red-500/10" : scanResult.severity === 'warning' ? "border-amber-500 bg-amber-500/10" : "border-emerald-500 bg-emerald-500/10"
                      )}
                      style={{
                        left: box.x,
                        top: box.y,
                        width: box.w,
                        height: box.h
                      }}
                    >
                      <span className={cn(
                        "absolute -top-6 left-0 px-1.5 py-0.5 rounded text-[8px] font-black text-white uppercase whitespace-nowrap",
                        scanResult.severity === 'critical' ? "bg-red-500" : scanResult.severity === 'warning' ? "bg-amber-500" : "bg-emerald-500"
                      )}>
                        {box.label} ({scanResult.confidence})
                      </span>
                    </div>
                  ))}

                  {/* Laser green scanning line indicator */}
                  {scanning && (
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-450 to-transparent shadow-[0_0_12px_#10b981] animate-bounce top-0 bottom-0" style={{ animationDuration: '3s' }} />
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    disabled={scanning}
                    onClick={handleResetScanner}
                    className="h-10 px-4 rounded-xl border border-surface-200 text-surface-650 hover:bg-surface-50 dark:border-white/10 dark:text-slate-350 dark:hover:bg-white/5 transition text-xs font-extrabold flex items-center gap-1.5"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reset
                  </button>

                  <button
                    disabled={scanning || scanResult}
                    onClick={handleRunScan}
                    className="flex-1 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-950/15 transition flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="h-4 w-4 animate-pulse" />
                    {t('scanner.analyze_btn')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Symptom Checklist */}
          <div className="rounded-2xl border border-white/70 bg-white/70 p-6 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055]">
            <h3 className="font-heading text-base font-black tracking-tight text-surface-950 dark:text-white flex items-center gap-2">
              <ListFilter className="h-5 w-5 text-emerald-500" />
              {t('scanner.symptoms_checklist')}
            </h3>
            <p className="text-xs text-surface-500 dark:text-slate-400 mt-0.5 mb-4">
              {t('scanner.symptoms_desc')}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SYMPTOMS_LIST.map((symp) => {
                const isSelected = selectedSymptoms.includes(symp.id)
                return (
                  <button
                    key={symp.id}
                    onClick={() => handleToggleSymptom(symp.id)}
                    className={cn(
                      "p-3 rounded-xl border text-left text-xs font-semibold flex items-center gap-3 transition-all",
                      isSelected
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-300 dark:border-emerald-500/30"
                        : "bg-white/50 border-surface-200/50 hover:bg-white dark:bg-white/5 dark:border-white/5 dark:text-slate-300"
                    )}
                  >
                    <div className={cn(
                      "h-4 w-4 rounded border flex items-center justify-center shrink-0 transition",
                      isSelected ? "bg-emerald-500 border-emerald-500 text-white" : "border-surface-300 dark:border-white/10 bg-white dark:bg-slate-950"
                    )}>
                      {isSelected && <CheckCircle2 className="h-3.5 w-3.5 fill-current" />}
                    </div>
                    {symp.name}
                  </button>
                )
              })}
            </div>
          </div>

        </div>

        {/* Right Panel (Scan Details & History log) */}
        <div className="space-y-6">
          
          {/* Active Diagnosis Card */}
          <div className="rounded-2xl border border-white/70 bg-white/70 p-6 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-base font-black tracking-tight text-surface-950 dark:text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-500" />
                Diagnostic Report
              </h3>
              {scanResult && (
                <button
                  onClick={triggerAudioReadout}
                  className={`grid h-8 w-8 place-items-center rounded-lg border transition ${
                    isSpeaking 
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 animate-pulse'
                      : 'border-surface-200 bg-white text-surface-500 hover:text-emerald-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400'
                  }`}
                  title="Read diagnostic result aloud"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {scanResult ? (
              <div className="space-y-4.5">
                <div className="flex items-center justify-between border-b border-surface-200/50 pb-3 dark:border-white/5">
                  <div>
                    <span className="text-[9px] font-bold text-surface-450 dark:text-slate-500 uppercase block">
                      {t('scanner.condition_detected')}
                    </span>
                    <span className="text-sm font-black text-surface-900 dark:text-white">{scanResult.condition}</span>
                  </div>
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border",
                    scanResult.severity === 'critical' 
                      ? "bg-red-500/10 border-red-500/20 text-red-650 dark:text-red-400" 
                      : scanResult.severity === 'warning'
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-650 dark:text-amber-400"
                        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-650 dark:text-emerald-400"
                  )}>
                    {scanResult.severity === 'critical' ? t('severity.critical') : scanResult.severity === 'warning' ? t('severity.medium') : t('severity.low')} ({scanResult.confidence})
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-surface-500 dark:text-slate-400 block">
                    {t('scanner.recommendation')}
                  </span>
                  <div className="p-3.5 rounded-xl bg-surface-50/50 dark:bg-white/5 border border-surface-200/50 dark:border-white/5 text-xs leading-relaxed text-surface-700 dark:text-slate-300 font-semibold">
                    {scanResult.recommendations}
                  </div>
                </div>

                {scanResult.severity === 'critical' && (
                  <a 
                    href="tel:+919440123456" 
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-650 hover:bg-red-700 text-white font-black text-xs py-3.5 shadow-lg transition"
                  >
                    <Phone className="h-4 w-4" />
                    Call Veterinarian (Dr. Rao)
                  </a>
                )}

                <div className="flex gap-2 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-[10px] leading-relaxed text-emerald-700 dark:text-emerald-300 font-bold">
                  <ShieldAlert className="h-5 w-5 shrink-0" />
                  <div>
                    <span className="font-black block uppercase text-emerald-800 dark:text-emerald-200">
                      {t('vet_disclaimer.title')}
                    </span>
                    {t('vet_disclaimer.text')}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-surface-500 dark:text-slate-400 border border-dashed border-surface-200 dark:border-white/5 rounded-xl">
                <Sparkles className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="text-xs font-semibold">Diagnostic Report Empty</p>
                <p className="text-[10px] mt-1 opacity-70">Complete an image diagnostic scan to generate real-time treatment protocols.</p>
              </div>
            )}
          </div>

          {/* Biosecurity Registry History */}
          <div className="rounded-2xl border border-white/70 bg-white/70 p-6 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055] space-y-4">
            <h3 className="font-heading text-sm font-black tracking-tight text-surface-950 dark:text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-500" />
              {t('scanner.scan_history')}
            </h3>
            
            <div className="space-y-3.5 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
              {history.map((scan) => (
                <div key={scan.id} className="flex gap-3 p-2.5 rounded-xl border border-surface-200/60 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] items-center hover:bg-white dark:hover:bg-white/5 transition-all">
                  <div className="h-11 w-11 rounded-lg overflow-hidden border border-surface-200/50 dark:border-white/10 bg-slate-900 shrink-0">
                    <img src={scan.imgUrl} alt={scan.condition} className="h-full w-full object-cover" />
                  </div>
                  
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black text-surface-900 dark:text-white truncate">{scan.condition}</span>
                      <span className={cn(
                        "text-[8px] font-black uppercase tracking-wider px-1.5 rounded",
                        scan.severity === 'critical' ? "bg-red-500/10 text-red-650" : scan.severity === 'warning' ? "bg-amber-500/10 text-amber-655" : "bg-emerald-500/10 text-emerald-655"
                      )}>
                        {scan.confidence}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-surface-450 dark:text-slate-400 font-semibold">
                      <span>{scan.date}</span>
                      <span className="font-bold text-surface-600 dark:text-slate-350">{scan.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  )
}
