import React, { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Filter,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  Warehouse,
  Wheat,
  X,
} from 'lucide-react'
import AppShell from '../components/ui/AppShell.jsx'
import StatCard from '../components/ui/StatCard.jsx'
import { useToast } from '../contexts/ToastContext.jsx'
import { TableSkeleton } from '../components/ui/Skeletons.jsx'
import useRealtimePoultry from '../hooks/useRealtimePoultry.js'
import {
  addDocument,
  updateDocument,
  deleteDocument,
  COLLECTIONS,
} from '../firebase'
import { useAuth } from '../contexts/AuthContext.jsx'
import { cn, formatCompactNumber } from '../lib/ui'

const BREEDS = ['Broiler', 'Layer', 'Dual Purpose', 'Cockerel', 'Rhode Island Red', 'Leghorn', 'Plymouth Rock', 'Cornish Cross', 'Other']
const FEED_TYPES = ['Starter', 'Grower', 'Finisher', 'Layer Mash', 'Broiler Concentrate', 'Organic Feed', 'Mixed Grain']
const VAC_STATUSES = ['Up to Date', 'Pending', 'Overdue', 'Not Started', 'Partially Done']
const EMPTY_FORM = { breed: '', birdCount: '', birdAge: '', birdWeight: '', feedType: '', vaccinationStatus: '' }
const PAGE_SIZE = 8

const MOCK_RECORDS = [
  { id: 'mock-1', breed: 'Leghorn', birdCount: 250, birdAge: 45, birdWeight: 1.8, feedType: 'Layer Mash', vaccinationStatus: 'Up to Date' },
  { id: 'mock-2', breed: 'Broiler', birdCount: 500, birdAge: 28, birdWeight: 2.1, feedType: 'Finisher', vaccinationStatus: 'Pending' },
  { id: 'mock-3', breed: 'Layer', birdCount: 300, birdAge: 60, birdWeight: 1.9, feedType: 'Layer Mash', vaccinationStatus: 'Up to Date' },
  { id: 'mock-4', breed: 'Rhode Island Red', birdCount: 150, birdAge: 15, birdWeight: 0.6, feedType: 'Starter', vaccinationStatus: 'Overdue' },
]

function validate(form) {
  const errors = {}
  if (!form.breed) errors.breed = 'Required'
  if (!form.birdCount || Number.isNaN(Number(form.birdCount)) || Number(form.birdCount) < 0) errors.birdCount = 'Enter a valid bird count'
  if (!form.birdAge || Number.isNaN(Number(form.birdAge)) || Number(form.birdAge) < 0) errors.birdAge = 'Enter a valid age'
  if (!form.birdWeight || Number.isNaN(Number(form.birdWeight)) || Number(form.birdWeight) <= 0) errors.birdWeight = 'Enter a valid weight'
  if (!form.feedType) errors.feedType = 'Required'
  if (!form.vaccinationStatus) errors.vaccinationStatus = 'Required'
  return errors
}

function getFallbackRecords() {
  const local = window.localStorage.getItem('poultry_records')
  if (local) return JSON.parse(local)

  window.localStorage.setItem('poultry_records', JSON.stringify(MOCK_RECORDS))
  return MOCK_RECORDS
}

function statusClass(status) {
  const map = {
    'Up to Date': 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-200 dark:ring-emerald-400/20',
    Pending: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-200 dark:ring-amber-400/20',
    Overdue: 'bg-red-50 text-red-600 ring-red-200 dark:bg-red-500/10 dark:text-red-200 dark:ring-red-400/20',
    'Not Started': 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-white/10 dark:text-slate-300 dark:ring-white/10',
    'Partially Done': 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-400/10 dark:text-sky-200 dark:ring-sky-400/20',
  }
  return map[status] || map['Not Started']
}

function StatusBadge({ status }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-black ring-1', statusClass(status))}>
      {status || 'Unknown'}
    </span>
  )
}

export default function FlockManager() {
  const { user } = useAuth()
  const { records, setRecords, summary, loading, error, isOffline: permissionWarning } = useRealtimePoultry()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const { showToast } = useToast()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter])

  const stats = useMemo(() => {
    return {
      totalBirds: summary.totalBirds,
      avgWeight: summary.avgWeight,
      protectedCount: summary.protectedFlocks,
    }
  }, [summary])

  const filteredRecords = useMemo(() => {
    const queryText = search.trim().toLowerCase()
    return records.filter((record) => {
      const matchesSearch = !queryText || [record.breed, record.feedType, record.vaccinationStatus]
        .some((value) => String(value || '').toLowerCase().includes(queryText))
      const matchesStatus = statusFilter === 'All' || record.vaccinationStatus === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [records, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginatedRecords = filteredRecords.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    if (errors[name]) setErrors((current) => ({ ...current, [name]: '' }))
  }

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setErrors({})
    setEditId(null)
    setShowForm(true)
  }

  const openEdit = (record) => {
    setForm({
      breed: record.breed || '',
      birdCount: String(record.birdCount ?? ''),
      birdAge: String(record.birdAge ?? ''),
      birdWeight: String(record.birdWeight ?? ''),
      feedType: record.feedType || '',
      vaccinationStatus: record.vaccinationStatus || '',
    })
    setErrors({})
    setEditId(record.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    const nextErrors = validate(form)
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    setSaving(true)
    try {
      const payload = {
        breed: form.breed,
        birdCount: Number(form.birdCount),
        birdAge: Number(form.birdAge),
        birdWeight: Number(form.birdWeight),
        feedType: form.feedType,
        vaccinationStatus: form.vaccinationStatus,
      }

      if (permissionWarning) {
        let updated
        if (editId) {
          updated = records.map((record) => record.id === editId ? { ...record, ...payload, updatedAt: new Date().toISOString() } : record)
          showToast('Record updated successfully')
        } else {
          updated = [{ ...payload, id: `local-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...records]
          showToast('Poultry record added successfully')
        }
        setRecords(updated)
        window.localStorage.setItem('poultry_records', JSON.stringify(updated))
      } else if (editId) {
        await updateDocument(COLLECTIONS.poultry, editId, payload)
        showToast('Record updated successfully')
      } else {
        await addDocument(COLLECTIONS.poultry, payload, user?.uid || '')
        showToast('Poultry record added successfully')
      }

      setShowForm(false)
      setEditId(null)
    } catch (err) {
      showToast(`Error saving record: ${err.message}`, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      if (permissionWarning) {
        const updated = records.filter((record) => record.id !== id)
        setRecords(updated)
        window.localStorage.setItem('poultry_records', JSON.stringify(updated))
      } else {
        await deleteDocument(COLLECTIONS.poultry, id)
      }
      showToast('Record deleted successfully')
    } catch (err) {
      showToast(`Error deleting record: ${err.message}`, 'error')
    } finally {
      setDeleteConfirm(null)
    }
  }

  const Field = ({ label, name, type = 'text', placeholder, options }) => (
    <div>
      <label className="mb-1.5 block text-sm font-black text-surface-700 dark:text-slate-200">{label}</label>
      {options ? (
        <select
          name={name}
          value={form[name]}
          onChange={handleChange}
          className={cn(
            'h-11 w-full rounded-lg border bg-white px-3 text-sm font-semibold text-surface-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:bg-slate-950 dark:text-white',
            errors[name] ? 'border-red-300 dark:border-red-400/40' : 'border-surface-200 dark:border-white/10'
          )}
        >
          <option value="">Select {label}</option>
          {options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : (
        <input
          name={name}
          type={type}
          min={type === 'number' ? '0' : undefined}
          step={name === 'birdWeight' ? '0.01' : undefined}
          value={form[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className={cn(
            'h-11 w-full rounded-lg border bg-white px-3 text-sm font-semibold text-surface-900 outline-none transition placeholder:text-surface-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500',
            errors[name] ? 'border-red-300 dark:border-red-400/40' : 'border-surface-200 dark:border-white/10'
          )}
        />
      )}
      {errors[name] && <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-red-500"><AlertCircle className="h-3 w-3" />{errors[name]}</p>}
    </div>
  )

  return (
    <AppShell
      title="Poultry Manager"
      subtitle="CRUD workflows for flock inventory, growth, feed, and vaccination records."
      actions={(
        <button
          id="add-flock-btn"
          type="button"
          onClick={openAdd}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-green-800 px-3 text-sm font-black text-white shadow-lg shadow-emerald-700/25 transition hover:-translate-y-0.5 hover:shadow-emerald-700/35 sm:px-4"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add flock</span>
        </button>
      )}
    >
      {permissionWarning && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50/90 p-4 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-bold">Firestore permission warning</p>
            <p className="mt-1 text-sm">Cloud rules blocked this session, so records are being managed in localStorage fallback mode.</p>
          </div>
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Records"
          value={records.length}
          detail="Managed flock entries"
          trend={permissionWarning ? 'Local' : 'Live'}
          icon={Warehouse}
          accent="emerald"
          miniData={records.map((_, index) => ({ name: String(index), value: index + 1 })).slice(0, 8)}
        />
        <StatCard
          label="Total Birds"
          value={stats.totalBirds}
          detail="Across active records"
          trend="Tracked"
          icon={Warehouse}
          accent="sky"
          miniData={records.slice(0, 8).map((record, index) => ({ name: String(index), value: Number(record.birdCount) || 0 }))}
          formatter={(value) => formatCompactNumber(Math.round(value))}
          delay={0.05}
        />
        <StatCard
          label="Avg Weight"
          value={stats.avgWeight}
          detail="Kilograms per record"
          trend={stats.avgWeight >= 1.5 ? 'Stable' : 'Watch'}
          trendDirection={stats.avgWeight >= 1.5 ? 'up' : 'down'}
          icon={Wheat}
          accent="amber"
          miniData={records.slice(0, 8).map((record, index) => ({ name: String(index), value: Number(record.birdWeight) || 0 }))}
          formatter={(value) => `${value.toFixed(2)} kg`}
          delay={0.1}
        />
        <StatCard
          label="Protected"
          value={stats.protectedCount}
          detail="Vaccination up to date"
          trend="Health"
          icon={ShieldCheck}
          accent="violet"
          miniData={records.slice(0, 8).map((record, index) => ({ name: String(index), value: record.vaccinationStatus === 'Up to Date' ? 1 : 0 }))}
          delay={0.15}
        />
      </section>

      <section className="rounded-lg border border-white/70 bg-white/82 shadow-xl shadow-emerald-950/[0.04] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055]">
        <div className="flex flex-col gap-4 border-b border-surface-200/80 p-4 dark:border-white/10 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-heading text-xl font-black tracking-tight text-surface-950 dark:text-white">Flock Records</h2>
            <p className="mt-1 text-sm text-surface-500 dark:text-slate-400">
              {filteredRecords.length} matching records from {records.length} total entries.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex h-10 items-center gap-2 rounded-lg border border-surface-200 bg-white px-3 text-surface-500 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
              <Search className="h-4 w-4" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search breed, feed, status"
                className="w-full min-w-0 bg-transparent text-sm font-semibold text-surface-800 outline-none placeholder:text-surface-400 dark:text-white dark:placeholder:text-slate-500 sm:w-56"
              />
            </label>
            <label className="flex h-10 items-center gap-2 rounded-lg border border-surface-200 bg-white px-3 text-surface-500 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
              <Filter className="h-4 w-4" />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="bg-transparent text-sm font-bold text-surface-800 outline-none dark:text-white"
              >
                <option value="All">All statuses</option>
                {VAC_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>
          </div>
        </div>

        {error ? (
          <div className="p-4">
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-200">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-bold">Connection error</p>
                <p className="mt-1 text-sm">{error}</p>
                <button type="button" onClick={() => window.location.reload()} className="mt-3 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-700">
                  Retry connection
                </button>
              </div>
            </div>
          </div>
        ) : loading ? (
          <TableSkeleton />
        ) : filteredRecords.length === 0 ? (
          <div className="grid min-h-72 place-items-center p-8 text-center">
            <div>
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200">
                <Warehouse className="h-7 w-7" />
              </div>
              <p className="mt-4 font-heading text-xl font-black text-surface-950 dark:text-white">No matching records</p>
              <p className="mt-1 text-sm text-surface-500 dark:text-slate-400">Adjust your filters or add a new flock record.</p>
              <button type="button" onClick={openAdd} className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-black text-white transition hover:bg-emerald-700">
                <Plus className="h-4 w-4" />
                Add flock
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-auto p-3">
              <table className="w-full min-w-[980px] border-separate border-spacing-y-2 text-sm">
                <thead className="sticky top-0 z-10">
                  <tr className="text-left text-xs font-black uppercase tracking-[0.14em] text-surface-400 dark:text-slate-500">
                    {['Breed', 'Birds', 'Age', 'Weight', 'Feed type', 'Vaccination', 'Actions'].map((heading) => (
                      <th key={heading} className="bg-white/95 px-4 py-3 backdrop-blur dark:bg-slate-950/95">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecords.map((record) => (
                    <tr key={record.id} className="group">
                      <td className="rounded-l-lg border-y border-l border-surface-200/70 bg-white px-4 py-3.5 font-black text-surface-900 shadow-sm transition group-hover:border-emerald-200 group-hover:bg-emerald-50/50 dark:border-white/10 dark:bg-white/[0.035] dark:text-white dark:group-hover:border-emerald-400/20 dark:group-hover:bg-emerald-400/10">
                        <div className="flex items-center gap-3">
                          <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
                            <Warehouse className="h-4 w-4" />
                          </span>
                          {record.breed}
                        </div>
                      </td>
                      <td className="border-y border-surface-200/70 bg-white px-4 py-3.5 font-black text-emerald-700 transition group-hover:border-emerald-200 group-hover:bg-emerald-50/50 dark:border-white/10 dark:bg-white/[0.035] dark:text-emerald-200 dark:group-hover:border-emerald-400/20 dark:group-hover:bg-emerald-400/10">
                        {Number(record.birdCount || 0).toLocaleString()}
                      </td>
                      <td className="border-y border-surface-200/70 bg-white px-4 py-3.5 font-semibold text-surface-600 transition group-hover:border-emerald-200 group-hover:bg-emerald-50/50 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-300 dark:group-hover:border-emerald-400/20 dark:group-hover:bg-emerald-400/10">
                        {record.birdAge} days
                      </td>
                      <td className="border-y border-surface-200/70 bg-white px-4 py-3.5 font-semibold text-surface-600 transition group-hover:border-emerald-200 group-hover:bg-emerald-50/50 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-300 dark:group-hover:border-emerald-400/20 dark:group-hover:bg-emerald-400/10">
                        {record.birdWeight} kg
                      </td>
                      <td className="border-y border-surface-200/70 bg-white px-4 py-3.5 font-semibold text-surface-600 transition group-hover:border-emerald-200 group-hover:bg-emerald-50/50 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-300 dark:group-hover:border-emerald-400/20 dark:group-hover:bg-emerald-400/10">
                        {record.feedType}
                      </td>
                      <td className="border-y border-surface-200/70 bg-white px-4 py-3.5 transition group-hover:border-emerald-200 group-hover:bg-emerald-50/50 dark:border-white/10 dark:bg-white/[0.035] dark:group-hover:border-emerald-400/20 dark:group-hover:bg-emerald-400/10">
                        <StatusBadge status={record.vaccinationStatus} />
                      </td>
                      <td className="rounded-r-lg border-y border-r border-surface-200/70 bg-white px-4 py-3.5 transition group-hover:border-emerald-200 group-hover:bg-emerald-50/50 dark:border-white/10 dark:bg-white/[0.035] dark:group-hover:border-emerald-400/20 dark:group-hover:bg-emerald-400/10">
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => openEdit(record)} className="grid h-8 w-8 place-items-center rounded-lg text-sky-600 transition hover:bg-sky-50 dark:text-sky-200 dark:hover:bg-sky-400/10" aria-label="Edit record">
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => setDeleteConfirm(record.id)} className="grid h-8 w-8 place-items-center rounded-lg text-red-500 transition hover:bg-red-50 dark:text-red-200 dark:hover:bg-red-500/10" aria-label="Delete record">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-surface-200/80 px-4 py-3 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-surface-500 dark:text-slate-400">
                Showing {(safePage - 1) * PAGE_SIZE + 1}-{Math.min(safePage * PAGE_SIZE, filteredRecords.length)} of {filteredRecords.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={safePage === 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-surface-200 bg-white text-surface-600 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-black text-surface-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                  Page {safePage} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={safePage === totalPages}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-surface-200 bg-white text-surface-600 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-white/70 bg-white shadow-2xl shadow-slate-950/25 dark:border-white/10 dark:bg-slate-950"
            >
              <div className="flex items-start justify-between gap-4 border-b border-surface-200 p-5 dark:border-white/10">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">Flock record</p>
                  <h2 className="mt-1 font-heading text-2xl font-black text-surface-950 dark:text-white">{editId ? 'Edit flock' : 'Add flock'}</h2>
                  <p className="mt-1 text-sm text-surface-500 dark:text-slate-400">Update inventory, growth, feed, and vaccination data.</p>
                </div>
                <button type="button" onClick={() => { setShowForm(false); setEditId(null) }} className="grid h-9 w-9 place-items-center rounded-lg text-surface-500 transition hover:bg-surface-100 dark:text-slate-300 dark:hover:bg-white/10" aria-label="Close form">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
                <Field label="Breed" name="breed" options={BREEDS} />
                <Field label="Bird Count" name="birdCount" type="number" placeholder="500" />
                <Field label="Bird Age (days)" name="birdAge" type="number" placeholder="28" />
                <Field label="Bird Weight (kg)" name="birdWeight" type="number" placeholder="1.85" />
                <Field label="Feed Type" name="feedType" options={FEED_TYPES} />
                <Field label="Vaccination Status" name="vaccinationStatus" options={VAC_STATUSES} />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-surface-200 bg-surface-50/80 p-5 dark:border-white/10 dark:bg-white/[0.035] sm:flex-row sm:justify-end">
                <button type="button" onClick={() => { setShowForm(false); setEditId(null) }} className="h-10 rounded-lg border border-surface-200 bg-white px-4 text-sm font-black text-surface-600 transition hover:bg-surface-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10">
                  Cancel
                </button>
                <button
                  id="save-flock-btn"
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-green-800 px-4 text-sm font-black text-white shadow-lg shadow-emerald-700/25 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Saving
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {editId ? 'Update record' : 'Save record'}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              className="w-full max-w-sm rounded-lg border border-white/70 bg-white p-5 text-center shadow-2xl dark:border-white/10 dark:bg-slate-950"
            >
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-200">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-heading text-xl font-black text-surface-950 dark:text-white">Delete this record?</h3>
              <p className="mt-1 text-sm text-surface-500 dark:text-slate-400">This removes the flock record from the current data source.</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setDeleteConfirm(null)} className="h-10 rounded-lg border border-surface-200 bg-white text-sm font-black text-surface-600 transition hover:bg-surface-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                  Cancel
                </button>
                <button type="button" onClick={() => handleDelete(deleteConfirm)} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 text-sm font-black text-white transition hover:bg-red-700">
                  <Check className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  )
}
