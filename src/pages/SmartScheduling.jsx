import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarClock,
  Plus,
  Trash2,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  ShieldCheck,
  ChevronRight,
  X,
  Wheat,
  ListTodo,
  BellRing,
  CheckSquare,
  Square
} from 'lucide-react'
import AppShell from '../components/ui/AppShell.jsx'
import StatCard from '../components/ui/StatCard.jsx'
import useRealtimeVaccination from '../hooks/useRealtimeVaccination.js'
import useRealtimePoultry from '../hooks/useRealtimePoultry.js'
import { COLLECTIONS, addDocument, updateDocument, deleteDocument } from '../firebase'
import { useToast } from '../contexts/ToastContext.jsx'
import { cn } from '../lib/ui'

const DEFAULT_MOCK_VACCINATIONS = [
  { id: 'vac-1', vaccineName: 'Newcastle Disease (ND)', flockId: 'mock-1', scheduledDate: new Date(Date.now() - 10*24*60*60*1000).toISOString(), dosage: '0.2 ml / bird (Drinking water)', administeredBy: 'Dr. Angela Carter', status: 'completed', createdAt: new Date().toISOString() },
  { id: 'vac-2', vaccineName: 'Infectious Bronchitis (IB)', flockId: 'mock-2', scheduledDate: new Date(Date.now() - 3*24*60*60*1000).toISOString(), dosage: 'Ocular Spray', administeredBy: 'Dr. Mark Rayson', status: 'completed', createdAt: new Date().toISOString() },
  { id: 'vac-3', vaccineName: 'Gumboro (IBD)', flockId: 'mock-3', scheduledDate: new Date(Date.now() + 4*24*60*60*1000).toISOString(), dosage: '0.5 ml / bird (Oral drop)', administeredBy: 'Dr. Angela Carter', status: 'pending', createdAt: new Date().toISOString() },
  { id: 'vac-4', vaccineName: 'Fowl Pox Vaccine', flockId: 'mock-4', scheduledDate: new Date(Date.now() - 5*24*60*60*1000).toISOString(), dosage: 'Wing-web puncture', administeredBy: 'Dr. Mark Rayson', status: 'pending', createdAt: new Date().toISOString() },
]

export default function SmartScheduling() {
  const { addToast } = useToast()
  
  // Real-time vaccination list
  const { records: rawRecords, loading: vacLoading, error: vacError, isOffline } = useRealtimeVaccination()
  const { records: flocks } = useRealtimePoultry()

  // Use DB records or mock fallback
  const records = useMemo(() => {
    return rawRecords.length > 0 ? rawRecords : DEFAULT_MOCK_VACCINATIONS
  }, [rawRecords])

  // Sub-tabs: 'vaccination' | 'feed' | 'tasks'
  const [activeTab, setActiveTab] = useState('vaccination')

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false)
  const [vacName, setVacName] = useState('')
  const [targetFlockId, setTargetFlockId] = useState('general')
  const [scheduledDate, setScheduledDate] = useState('')
  const [dosage, setDosage] = useState('')
  const [administeredBy, setAdministeredBy] = useState('')

  // Feeding Routines State (simulated)
  const [feedSchedules, setFeedSchedules] = useState([
    { id: 'fs-1', time: '07:30 AM', breed: 'Broilers', feedType: 'Starter Crumble', amountKg: 80, active: true },
    { id: 'fs-2', time: '11:00 AM', breed: 'Layers', feedType: 'Layer Mash', amountKg: 120, active: true },
    { id: 'fs-3', time: '04:30 PM', breed: 'Broilers', feedType: 'Grower Pellet', amountKg: 95, active: true },
  ])

  // Staff Tasks Checklist (simulated state)
  const [staffTasks, setStaffTasks] = useState([
    { id: 'st-1', task: 'Check brooder house temperature & relative humidity', time: '08:00 AM', done: true, priority: 'High' },
    { id: 'st-2', task: 'Consolidate morning egg crate collection', time: '10:00 AM', done: false, priority: 'Medium' },
    { id: 'st-3', task: 'Sanitize feed silos & clean drinking dispensers', time: '01:30 PM', done: false, priority: 'High' },
    { id: 'st-4', task: 'Review automated biosecurity camera diagnostic report', time: '04:00 PM', done: false, priority: 'Low' },
  ])

  // Compute schedule metrics
  const summary = useMemo(() => {
    const now = new Date()
    const completed = records.filter((r) => r.status === 'completed' || r.status === 'done')
    
    const upcoming = records.filter((r) => {
      if (r.status === 'completed' || r.status === 'done') return false
      const d = new Date(r.scheduledDate)
      return d >= now
    })

    const overdue = records.filter((r) => {
      if (r.status === 'completed' || r.status === 'done') return false
      const d = new Date(r.scheduledDate)
      return d < now
    })

    return {
      completedCount: completed.length,
      upcomingCount: upcoming.length,
      overdueCount: overdue.length,
      overdueItems: overdue,
      totalCount: records.length
    }
  }, [records])

  // Map flock IDs to labels
  const getFlockLabel = (flockId) => {
    if (flockId === 'general') return 'General / Unlinked'
    
    const mockFlocks = [
      { id: 'mock-1', breed: 'Leghorn' },
      { id: 'mock-2', breed: 'Broiler' },
      { id: 'mock-3', breed: 'Layer' },
      { id: 'mock-4', breed: 'Rhode Island Red' }
    ]

    const matched = flocks.find((f) => f.id === flockId) || mockFlocks.find((f) => f.id === flockId)
    return matched ? `Flock #${flockId.slice(-4).toUpperCase()} (${matched.breed})` : `Flock #${flockId.slice(-4).toUpperCase()}`
  }

  // Create vaccination schedule entry
  const handleCreateSchedule = async (e) => {
    e.preventDefault()
    if (!vacName || !scheduledDate || !dosage) {
      addToast('error', 'Please fill in all mandatory fields.')
      return
    }

    const payload = {
      vaccineName: vacName,
      flockId: targetFlockId,
      scheduledDate: new Date(scheduledDate).toISOString(),
      dosage,
      administeredBy: administeredBy || 'Unassigned',
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    try {
      if (isOffline) {
        // Mock add locally
        addToast('success', '[Offline] Scheduled vaccination added locally.')
      } else {
        await addDocument(COLLECTIONS.vaccinations, payload)
        addToast('success', 'Vaccination program scheduled successfully.')
      }
      setShowAddModal(false)
      // reset forms
      setVacName('')
      setTargetFlockId('general')
      setScheduledDate('')
      setDosage('')
      setAdministeredBy('')
    } catch (err) {
      addToast('error', `Failed to create schedule: ${err.message}`)
    }
  }

  // Toggle status of a vaccination program
  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed'
    try {
      if (isOffline) {
        addToast('success', `[Offline] Vaccination status toggled locally to "${nextStatus}".`)
      } else {
        await updateDocument(COLLECTIONS.vaccinations, id, { status: nextStatus })
        addToast('success', `Schedule status updated to "${nextStatus}".`)
      }
    } catch (err) {
      addToast('error', `Failed to update status: ${err.message}`)
    }
  }

  // Delete vaccination entry
  const handleDeleteSchedule = async (id) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return
    try {
      if (isOffline) {
        addToast('success', '[Offline] Vaccination program removed from local state.')
      } else {
        await deleteDocument(COLLECTIONS.vaccinations, id)
        addToast('success', 'Vaccination program removed from schedule.')
      }
    } catch (err) {
      addToast('error', `Failed to delete schedule: ${err.message}`)
    }
  }

  // Toggle Feed Routine schedule state
  const handleToggleFeed = (id) => {
    setFeedSchedules(prev => prev.map(f => f.id === id ? { ...f, active: !f.active } : f))
    addToast('success', 'Feed schedule status updated.')
  }

  // Toggle Staff Task completion
  const handleToggleTask = (id) => {
    setStaffTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  return (
    <AppShell title="Smart Scheduling" subtitle="Vaccination alerts, automated feeding routines, and staff task tracking">
      
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Immunization Coverage"
          value={summary.completedCount}
          formatter={(v) => `${v}/${summary.totalCount}`}
          detail="Completed programs"
          icon={ShieldCheck}
          accent="emerald"
        />
        <StatCard
          label="Overdue Vaccines"
          value={summary.overdueCount}
          detail="Urgent biosecurity hazard"
          icon={AlertTriangle}
          accent={summary.overdueCount > 0 ? 'red' : 'emerald'}
        />
        <StatCard
          label="Upcoming Operations"
          value={summary.upcomingCount}
          detail="Programs next 30 days"
          icon={CalendarClock}
          accent="sky"
        />
        <StatCard
          label="Daily Feed Routines"
          value={feedSchedules.filter(f => f.active).length}
          detail="Automated silo cycles"
          icon={Wheat}
          accent="amber"
        />
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-surface-200/60 dark:border-white/5">
        <button
          onClick={() => setActiveTab('vaccination')}
          className={cn(
            "pb-3.5 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all duration-200",
            activeTab === 'vaccination'
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-surface-500 hover:text-surface-800"
          )}
        >
          <div className="flex items-center gap-1.5">
            <CalendarClock className="h-4 w-4" />
            Vaccination Log
          </div>
        </button>
        <button
          onClick={() => setActiveTab('feed')}
          className={cn(
            "pb-3.5 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all duration-200",
            activeTab === 'feed'
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-surface-500 hover:text-surface-800"
          )}
        >
          <div className="flex items-center gap-1.5">
            <Wheat className="h-4 w-4" />
            Feed Schedules
          </div>
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={cn(
            "pb-3.5 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all duration-200",
            activeTab === 'tasks'
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-surface-500 hover:text-surface-800"
          )}
        >
          <div className="flex items-center gap-1.5">
            <ListTodo className="h-4 w-4" />
            Staff Tasks ({staffTasks.filter(t => !t.done).length})
          </div>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="mt-4">
        {/* Panel 1: Vaccination Schedules */}
        {activeTab === 'vaccination' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/70 p-4 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055]">
              <div className="text-xs font-bold text-surface-550 dark:text-slate-400">
                Manage operational immunizations and veterinary schedules
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-emerald-500 px-4 text-xs font-black uppercase tracking-wider text-white hover:bg-emerald-600 transition shadow-sm"
              >
                <Plus className="h-4.5 w-4.5" />
                Schedule Program
              </button>
            </div>

            {/* Schedules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {records.map((vac) => {
                const isOverdue = vac.status === 'pending' && new Date(vac.scheduledDate) < new Date()
                const isCompleted = vac.status === 'completed' || vac.status === 'done'

                return (
                  <div
                    key={vac.id}
                    className={cn(
                      "rounded-2xl border bg-white/80 p-5 transition hover:shadow-lg dark:bg-slate-950/80 flex flex-col justify-between",
                      isCompleted 
                        ? "border-emerald-200/60 dark:border-emerald-500/10" 
                        : isOverdue 
                        ? "border-red-200/70 dark:border-red-500/15" 
                        : "border-surface-200/50 dark:border-white/5"
                    )}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h4 className="font-heading text-sm font-black text-surface-950 dark:text-white">
                            {vac.vaccineName}
                          </h4>
                          <p className="text-xs text-surface-450 dark:text-slate-400 font-bold">
                            {getFlockLabel(vac.flockId)}
                          </p>
                        </div>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider block shrink-0",
                          isCompleted
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : isOverdue
                            ? "bg-red-500/10 text-red-650 dark:text-red-400 animate-pulse"
                            : "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                        )}>
                          {isCompleted ? 'Completed' : isOverdue ? 'Overdue' : 'Scheduled'}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3.5 border-t border-surface-200/40 pt-4 dark:border-white/5 text-[11px] font-semibold text-surface-550 dark:text-slate-400">
                        <div className="space-y-1">
                          <span className="text-[9px] font-black text-surface-400 uppercase">Scheduled Date</span>
                          <p className="flex items-center gap-1 text-surface-900 dark:text-white">
                            <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                            {new Date(vac.scheduledDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] font-black text-surface-400 uppercase">Dosage Method</span>
                          <p className="text-surface-900 dark:text-white truncate" title={vac.dosage}>
                            {vac.dosage}
                          </p>
                        </div>
                        <div className="space-y-1 col-span-2">
                          <span className="text-[9px] font-black text-surface-400 uppercase">Administered By</span>
                          <p className="flex items-center gap-1 text-surface-900 dark:text-white">
                            <User className="h-3.5 w-3.5 text-emerald-500" />
                            {vac.administeredBy}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-end gap-2 border-t border-surface-200/40 pt-4 dark:border-white/5">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(vac.id, vac.status)}
                        className={cn(
                          "h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                          isCompleted
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                        )}
                      >
                        {isCompleted ? 'Mark Pending' : 'Mark Administered'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSchedule(vac.id)}
                        className="h-8 w-8 grid place-items-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition dark:border-red-500/10 dark:hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Panel 2: Feed Schedules */}
        {activeTab === 'feed' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/70 bg-white/70 p-6 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055]">
              <h3 className="font-heading text-base font-black tracking-tight text-surface-950 dark:text-white">
                Daily Feed Dispensation Schedules
              </h3>
              <p className="text-xs text-surface-500 dark:text-slate-400 mt-0.5 mb-4">
                Automated feeding triggers for silo gates and motor dispensers
              </p>

              <div className="space-y-3.5">
                {feedSchedules.map((feed) => (
                  <div
                    key={feed.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-surface-200 bg-white dark:border-white/5 dark:bg-slate-950/80"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-lg bg-amber-500/10 text-amber-500 dark:bg-amber-500/20">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-heading text-sm font-black">{feed.time}</p>
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold px-1.5 py-0.5 rounded">
                            {feed.breed}
                          </span>
                        </div>
                        <p className="text-xs text-surface-450 dark:text-slate-400 font-semibold mt-0.5">
                          {feed.feedType} — <span className="font-bold text-surface-900 dark:text-white">{feed.amountKg} kg</span> per gate
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full",
                        feed.active ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-surface-200 text-surface-500"
                      )}>
                        {feed.active ? 'Active trigger' : 'Disabled'}
                      </span>
                      <button
                        onClick={() => handleToggleFeed(feed.id)}
                        className={cn(
                          "h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                          feed.active 
                            ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" 
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                        )}
                      >
                        {feed.active ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Panel 3: Staff Tasks */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/70 bg-white/70 p-6 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055]">
              <h3 className="font-heading text-base font-black tracking-tight text-surface-950 dark:text-white">
                Coop Daily Audits & Tasks
              </h3>
              <p className="text-xs text-surface-500 dark:text-slate-400 mt-0.5 mb-5">
                Routines and biosecurity checklists for staff operators
              </p>

              <div className="space-y-3">
                {staffTasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => handleToggleTask(task.id)}
                    className="flex w-full items-start gap-3.5 p-4 rounded-xl border border-surface-200 bg-white text-left transition hover:bg-surface-50 dark:border-white/5 dark:bg-slate-950/85"
                  >
                    <span className="mt-0.5 text-emerald-500 shrink-0">
                      {task.done ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-xs font-semibold text-surface-900 dark:text-white leading-normal",
                        task.done && "line-through opacity-50"
                      )}>
                        {task.task}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-[9px] font-bold text-surface-400 dark:text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {task.time}
                        </span>
                        <span>•</span>
                        <span className={cn(
                          "uppercase",
                          task.priority === 'High' ? "text-red-500" : task.priority === 'Medium' ? "text-amber-500" : "text-emerald-500"
                        )}>
                          {task.priority} Priority
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.button
              type="button"
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
            />

            <motion.div
              className="relative z-10 w-full max-w-md rounded-2xl border border-white/70 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
            >
              <div className="flex items-center justify-between border-b border-surface-200/50 pb-4 dark:border-white/5">
                <h3 className="font-heading text-base font-black text-surface-950 dark:text-white">
                  Schedule Vaccination Program
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg p-1 text-surface-450 hover:bg-surface-100 dark:text-slate-400 dark:hover:bg-white/5"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSchedule} className="mt-4 space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-surface-555 dark:text-slate-400 block mb-1">
                    Vaccine Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Newcastle Disease (ND)"
                    value={vacName}
                    onChange={(e) => setVacName(e.target.value)}
                    className="h-10 w-full rounded-xl border border-surface-200 bg-white px-3 text-xs font-semibold outline-none focus:border-emerald-500 dark:border-white/10 dark:bg-slate-900 text-surface-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-surface-555 dark:text-slate-400 block mb-1">
                    Target Poultry Flock
                  </label>
                  <select
                    value={targetFlockId}
                    onChange={(e) => setTargetFlockId(e.target.value)}
                    className="h-10 w-full rounded-xl border border-surface-200 bg-white px-3 text-xs font-semibold outline-none focus:border-emerald-500 dark:border-white/10 dark:bg-slate-900 text-surface-900 dark:text-white"
                  >
                    <option value="general">General / Unlinked</option>
                    {flocks.map((f) => (
                      <option key={f.id} value={f.id}>
                        Flock #{f.id.slice(-4).toUpperCase()} ({f.breed})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-surface-555 dark:text-slate-400 block mb-1">
                      Scheduled Date
                    </label>
                    <input
                      type="date"
                      required
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="h-10 w-full rounded-xl border border-surface-200 bg-white px-3 text-xs font-semibold outline-none focus:border-emerald-500 dark:border-white/10 dark:bg-slate-900 text-surface-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-surface-555 dark:text-slate-400 block mb-1">
                      Dosage / Method
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ocular spray"
                      value={dosage}
                      onChange={(e) => setDosage(e.target.value)}
                      className="h-10 w-full rounded-xl border border-surface-200 bg-white px-3 text-xs font-semibold outline-none focus:border-emerald-500 dark:border-white/10 dark:bg-slate-900 text-surface-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-surface-555 dark:text-slate-400 block mb-1">
                    Administered Veterinary
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Angela Carter"
                    value={administeredBy}
                    onChange={(e) => setAdministeredBy(e.target.value)}
                    className="h-10 w-full rounded-xl border border-surface-200 bg-white px-3 text-xs font-semibold outline-none focus:border-emerald-500 dark:border-white/10 dark:bg-slate-900 text-surface-900 dark:text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-surface-200/50 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="h-10 px-4 rounded-xl border border-surface-200 text-xs font-bold text-surface-700 hover:bg-surface-50 dark:border-white/15 dark:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-4 rounded-xl bg-emerald-500 text-xs font-black uppercase tracking-wider text-white hover:bg-emerald-600"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppShell>
  )
}
