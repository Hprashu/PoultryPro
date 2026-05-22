import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wheat,
  Plus,
  Minus,
  TrendingDown,
  AlertTriangle,
  FileText,
  Trash2,
  Calendar,
  Layers,
  Sparkles,
  ShoppingBag,
  Clock,
  Briefcase,
  X
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import AppShell from '../components/ui/AppShell.jsx'
import StatCard from '../components/ui/StatCard.jsx'
import useRealtimeFeed from '../hooks/useRealtimeFeed.js'
import useRealtimePoultry from '../hooks/useRealtimePoultry.js'
import { COLLECTIONS, addDocument, deleteDocument } from '../firebase'
import { useToast } from '../contexts/ToastContext.jsx'
import { cn } from '../lib/ui'

const formatCompactNumber = (number) => {
  return new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(number)
}

export default function FeedInventory() {
  const { addToast } = useToast()
  const { records, loading: feedLoading, error: feedError, isOffline } = useRealtimeFeed()
  const { records: flocks } = useRealtimePoultry()

  const [showInboundModal, setShowInboundModal] = useState(false)
  const [showOutboundModal, setShowOutboundModal] = useState(false)
  
  const [inboundType, setInboundType] = useState('Layer Mash')
  const [inboundQty, setInboundQty] = useState('')
  const [inboundCost, setInboundCost] = useState('')
  const [inboundSupplier, setInboundSupplier] = useState('')
  const [inboundMinStock, setInboundMinStock] = useState('100')

  const [outboundType, setOutboundType] = useState('Layer Mash')
  const [outboundQty, setOutboundQty] = useState('')
  const [outboundFlockId, setOutboundFlockId] = useState('general')
  const [outboundNotes, setOutboundNotes] = useState('')
  
  const stockLevels = useMemo(() => {
    const levels = {}
    const DEFAULT_TYPES = ['Layer Mash', 'Broiler Starter', 'Finisher Feed', 'Grower Feed']
    DEFAULT_TYPES.forEach(type => {
      levels[type] = { type, remaining: 0, minStock: 100, lastCost: 0 }
    })

    records.forEach((r) => {
      const type = r.feedType
      if (!type) return
      if (!levels[type]) {
        levels[type] = { type, remaining: 0, minStock: 100, lastCost: 0 }
      }
      levels[type].remaining += Number(r.quantity) || 0
      if (r.type === 'inbound') {
        levels[type].lastCost = Number(r.cost) || 0
        if (r.minStock) levels[type].minStock = Number(r.minStock)
      }
    })
    return Object.values(levels)
  }, [records])

  // Compute overall summary indicators
  const summary = useMemo(() => {
    const totalStock = stockLevels.reduce((sum, s) => sum + Math.max(0, s.remaining), 0)
    const lowStockItems = stockLevels.filter((s) => s.remaining < s.minStock)
    const feedExpenses = records
      .filter((r) => r.type === 'inbound')
      .reduce((sum, r) => sum + (Number(r.cost) || 0), 0)
    
    // Total consumption (absolute value)
    const totalConsumed = Math.abs(
      records
        .filter((r) => r.type === 'outbound')
        .reduce((sum, r) => sum + (Number(r.quantity) || 0), 0)
    )

    return {
      totalStock,
      lowStockCount: lowStockItems.length,
      lowStockItems,
      feedExpenses,
      totalConsumed
    }
  }, [records, stockLevels])

  // Feed consumption history chart data (grouped by date)
  const chartData = useMemo(() => {
    const grouped = {}
    // Collect last 7 days including current
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i*24*60*60*1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      grouped[d] = { date: d, consumed: 0, received: 0 }
    }

    records.forEach((r) => {
      const d = new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      if (grouped[d] !== undefined) {
        if (r.type === 'outbound') {
          grouped[d].consumed += Math.abs(Number(r.quantity) || 0)
        } else if (r.type === 'inbound') {
          grouped[d].received += Number(r.quantity) || 0
        }
      }
    })
    return Object.values(grouped)
  }, [records])

  // Submitting inbound stock replenishment
  const handleAddInbound = async (e) => {
    e.preventDefault()
    if (!inboundQty || !inboundCost) {
      addToast('error', 'Please enter quantity and total cost.')
      return
    }

    const payload = {
      feedType: inboundType,
      quantity: Math.abs(Number(inboundQty)),
      cost: Number(inboundCost),
      supplier: inboundSupplier || 'Direct Merchant',
      minStock: Number(inboundMinStock) || 50,
      type: 'inbound'
    }

    try {
      if (isOffline || records.length === 0) {
        // Mock offline registry
        const newRecord = { ...payload, id: `local-feed-${Date.now()}`, createdAt: new Date().toISOString() }
        const cached = window.localStorage.getItem('poultrypro_feed')
        const currentLocal = cached ? JSON.parse(cached) : []
        window.localStorage.setItem('poultrypro_feed', JSON.stringify([newRecord, ...currentLocal]))
        addToast('success', 'Replenished inventory logged (local fallback).')
      } else {
        await addDocument(COLLECTIONS.feed, payload)
        addToast('success', 'Feed inventory updated in cloud registry.')
      }

      // Reset Form & Close
      setInboundQty('')
      setInboundCost('')
      setInboundSupplier('')
      setShowInboundModal(false)
    } catch (err) {
      addToast('error', `Failed to log stock replenishment: ${err.message}`)
    }
  }

  // Submitting outbound feed log (consumption)
  const handleAddOutbound = async (e) => {
    e.preventDefault()
    if (!outboundQty) {
      addToast('error', 'Please enter consumed feed quantity.')
      return
    }

    // Verify stock is available
    const matchedStock = stockLevels.find((s) => s.type === outboundType)
    const currentQty = matchedStock ? matchedStock.remaining : 0
    if (Math.abs(Number(outboundQty)) > currentQty) {
      const confirmOverdraw = window.confirm(`Warning: Logging ${outboundQty} kg consumption will overdraw remaining ${outboundType} stock (${currentQty} kg remaining). Proceed anyway?`)
      if (!confirmOverdraw) return
    }

    const payload = {
      feedType: outboundType,
      quantity: -Math.abs(Number(outboundQty)), // negative number
      flockId: outboundFlockId,
      notes: outboundNotes || 'Routine feeding schedule',
      type: 'outbound'
    }

    try {
      if (isOffline || records.length === 0) {
        // Mock offline registry
        const newRecord = { ...payload, id: `local-feed-${Date.now()}`, createdAt: new Date().toISOString() }
        const cached = window.localStorage.getItem('poultrypro_feed')
        const currentLocal = cached ? JSON.parse(cached) : []
        window.localStorage.setItem('poultrypro_feed', JSON.stringify([newRecord, ...currentLocal]))
        addToast('success', 'Outbound consumption logged (local fallback).')
      } else {
        await addDocument(COLLECTIONS.feed, payload)
        addToast('success', 'Outbound feeding logged in cloud registry.')
      }

      // Reset Form & Close
      setOutboundQty('')
      setOutboundNotes('')
      setShowOutboundModal(false)
    } catch (err) {
      addToast('error', `Failed to log consumption: ${err.message}`)
    }
  }

  // Handle delete transaction
  const handleDeleteTransaction = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this log entry?')
    if (!confirmDelete) return

    try {
      if (id.startsWith('local-feed-')) {
        const cached = window.localStorage.getItem('poultrypro_feed')
        if (cached) {
          const currentLocal = JSON.parse(cached)
          const updated = currentLocal.filter((r) => r.id !== id)
          window.localStorage.setItem('poultrypro_feed', JSON.stringify(updated))
          addToast('success', 'Local entry removed.')
        }
      } else {
        await deleteDocument(COLLECTIONS.feed, id)
        addToast('success', 'Registry entry deleted.')
      }
    } catch (err) {
      addToast('error', `Deletion error: ${err.message}`)
    }
  }

  return (
    <AppShell title="Feed Inventory" subtitle="Track feed stocks, monitor low-stock thresholds, and log feeding logs">
      
      {/* Offline Status */}
      {isOffline && (
        <div className="flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-800 dark:border-amber-500/20 dark:text-amber-200">
          <AlertTriangle className="h-4.5 w-4.5 text-amber-500 shrink-0" />
          <span>Local storage fallback mode. Seed and offline actions will use local storage caching.</span>
        </div>
      )}

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Available Stock"
          value={summary.totalStock}
          formatter={(v) => `${v.toLocaleString()} kg`}
          detail="Active grain inventory"
          icon={Wheat}
          accent="emerald"
        />
        <StatCard
          label="Low Stock Alerts"
          value={summary.lowStockCount}
          formatter={(v) => `${v} alerts`}
          detail="Items below safety threshold"
          icon={AlertTriangle}
          accent={summary.lowStockCount > 0 ? 'amber' : 'emerald'}
        />
        <StatCard
          label="Weekly Consumption"
          value={summary.totalConsumed}
          formatter={(v) => `${v.toLocaleString()} kg`}
          detail="Total grain consumed"
          icon={TrendingDown}
          accent="sky"
        />
        <StatCard
          label="Cumulative Cost"
          value={summary.feedExpenses}
          formatter={(v) => `$${v.toLocaleString()}`}
          detail="Direct feed acquisitions"
          icon={ShoppingBag}
          accent="emerald"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Side: Current Stock Levels & Consumption Analytics */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recharts chart */}
          <div className="rounded-xl border border-white/70 bg-white/82 p-5 shadow-xl shadow-emerald-950/[0.03] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055]">
            <h3 className="font-heading text-base font-black tracking-tight text-surface-950 dark:text-white">
              7-Day Feed Dynamics
            </h3>
            <p className="text-xs text-surface-500 dark:text-slate-400 mt-0.5 mb-4">
              Daily comparison between inbound stock received and outbound feed consumed (kg)
            </p>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorConsumed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '11px',
                    }}
                  />
                  <Area type="monotone" name="Outbound (Consumed)" dataKey="consumed" stroke="#38bdf8" fillOpacity={1} fill="url(#colorConsumed)" strokeWidth={2} />
                  <Area type="monotone" name="Inbound (Received)" dataKey="received" stroke="#10b981" fillOpacity={1} fill="url(#colorReceived)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Transaction Ledger */}
          <div className="rounded-xl border border-white/70 bg-white/82 p-5 shadow-xl shadow-emerald-950/[0.03] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055]">
            <h3 className="font-heading text-base font-black tracking-tight text-surface-950 dark:text-white">
              Inventory transaction ledger
            </h3>
            <p className="text-xs text-surface-500 dark:text-slate-400 mt-0.5 mb-4">
              Historical ledger of incoming acquisitions and outbound flock feedings
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold">
                <thead>
                  <tr className="border-b border-surface-100 dark:border-white/5 font-black uppercase tracking-wider text-surface-400 dark:text-slate-500">
                    <th className="py-3">Date</th>
                    <th className="py-3">Type</th>
                    <th className="py-3">Feed Description</th>
                    <th className="py-3">Volume</th>
                    <th className="py-3">Financial Value</th>
                    <th className="py-3">Reference details</th>
                    <th className="py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100 dark:divide-white/5 text-surface-700 dark:text-slate-300">
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-surface-400">
                        No transactions logged yet.
                      </td>
                    </tr>
                  ) : (
                    records.map((r) => {
                      const isInbound = r.type === 'inbound'
                      return (
                        <tr key={r.id} className="hover:bg-surface-50 dark:hover:bg-white/5 transition duration-150">
                          <td className="py-3.5 whitespace-nowrap text-surface-500 dark:text-slate-400">
                            {new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3.5">
                            <span className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider",
                              isInbound 
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                                : "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300"
                            )}>
                              {isInbound ? 'Acquisition' : 'Consumption'}
                            </span>
                          </td>
                          <td className="py-3.5 font-bold text-surface-950 dark:text-white">
                            {r.feedType}
                          </td>
                          <td className={cn("py-3.5 font-black", isInbound ? "text-emerald-600 dark:text-emerald-400" : "text-sky-500")}>
                            {isInbound ? '+' : ''}{r.quantity} kg
                          </td>
                          <td className="py-3.5 text-surface-500 dark:text-slate-400">
                            {isInbound ? `$${r.cost}` : '—'}
                          </td>
                          <td className="py-3.5 max-w-[150px] truncate text-surface-400 dark:text-slate-500" title={r.notes || r.supplier}>
                            {isInbound ? `Supplier: ${r.supplier}` : (r.flockId !== 'general' ? `Flock #${r.flockId.slice(-4).toUpperCase()}` : r.notes)}
                          </td>
                          <td className="py-3.5 text-right">
                            <button
                              id={`delete-feed-btn-${r.id}`}
                              type="button"
                              onClick={() => handleDeleteTransaction(r.id)}
                              className="text-surface-400 hover:text-red-500 transition p-1"
                              title="Delete Transaction"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Side: Current Stock Levels & Quick Add Forms */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Remaining Grain Stocks card */}
          <div className="rounded-xl border border-white/70 bg-white/82 p-5 shadow-xl shadow-emerald-950/[0.03] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055]">
            <h3 className="font-heading text-base font-black tracking-tight text-surface-950 dark:text-white mb-1">
              Active Stock Levels
            </h3>
            <p className="text-xs text-surface-500 dark:text-slate-400 mb-4">
              Real-time grain volume remaining in storage silos
            </p>

            <div className="space-y-4">
              {stockLevels.map((stock) => {
                const percentage = Math.min(100, Math.max(0, (stock.remaining / (stock.minStock * 4)) * 100))
                const isCritical = stock.remaining < stock.minStock
                
                return (
                  <div key={stock.type} className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-surface-900 dark:text-slate-300 font-bold">{stock.type}</span>
                      <span className={cn("font-black", isCritical ? "text-amber-500" : "text-surface-950 dark:text-white")}>
                        {stock.remaining} kg <span className="text-[10px] text-surface-400 font-medium">/ min {stock.minStock} kg</span>
                      </span>
                    </div>

                    <div className="h-2 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full transition-all duration-500", isCritical ? "bg-amber-500 shadow-sm shadow-amber-500/30" : "bg-emerald-500 shadow-sm shadow-emerald-500/30")}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    
                    {isCritical && (
                      <div className="flex items-center gap-1 text-[10px] font-black text-amber-500">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        CRITICAL: Low Silo Volume — Order replenishment
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Quick Actions Buttons */}
            <div className="grid grid-cols-2 gap-3.5 mt-6 pt-5 border-t border-surface-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => setShowInboundModal(true)}
                className="flex items-center justify-center gap-1.5 h-10 rounded-lg bg-emerald-500 text-xs font-black uppercase tracking-wider text-white hover:bg-emerald-600 transition shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Acquisition
              </button>
              <button
                type="button"
                onClick={() => setShowOutboundModal(true)}
                className="flex items-center justify-center gap-1.5 h-10 rounded-lg border border-surface-200 dark:border-white/10 bg-white/5 text-xs font-black uppercase tracking-wider text-surface-700 dark:text-slate-300 hover:bg-white/10 transition"
              >
                <Minus className="h-4 w-4" />
                Log Feeding
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Inbound replenishment Modal */}
      <AnimatePresence>
        {showInboundModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowInboundModal(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative z-10 w-full max-w-md rounded-xl border border-surface-200 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-slate-900 dark:text-white">
              <div className="flex items-center justify-between border-b border-surface-100 pb-3 mb-4 dark:border-white/5">
                <h3 className="font-heading text-sm font-black uppercase tracking-wider text-surface-950 dark:text-white flex items-center gap-1.5">
                  <Wheat className="h-4 w-4 text-emerald-500" />
                  Replenish Feed Stocks
                </h3>
                <button type="button" onClick={() => setShowInboundModal(false)} className="text-surface-400 hover:text-white transition"><X className="h-4.5 w-4.5" /></button>
              </div>

              <form onSubmit={handleAddInbound} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-surface-700 dark:text-slate-300">Feed Type</label>
                  <select value={inboundType} onChange={(e) => setInboundType(e.target.value)} className="w-full h-10 rounded-lg border border-surface-200 bg-white px-3 text-xs font-semibold text-surface-900 outline-none dark:border-white/10 dark:bg-slate-950 dark:text-white">
                    <option value="Layer Mash">Layer Mash</option>
                    <option value="Broiler Starter">Broiler Starter</option>
                    <option value="Finisher Feed">Finisher Feed</option>
                    <option value="Grower Feed">Grower Feed</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-surface-700 dark:text-slate-300">Quantity (kg)</label>
                    <input type="number" required min="1" placeholder="e.g. 500" value={inboundQty} onChange={(e) => setInboundQty(e.target.value)} className="w-full h-10 rounded-lg border border-surface-200 bg-white px-3 text-xs font-semibold text-surface-900 outline-none dark:border-white/10 dark:bg-slate-950 dark:text-white" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-surface-700 dark:text-slate-300">Total Cost ($)</label>
                    <input type="number" required min="1" placeholder="e.g. 350" value={inboundCost} onChange={(e) => setInboundCost(e.target.value)} className="w-full h-10 rounded-lg border border-surface-200 bg-white px-3 text-xs font-semibold text-surface-900 outline-none dark:border-white/10 dark:bg-slate-950 dark:text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-surface-700 dark:text-slate-300">Supplier</label>
                    <input type="text" placeholder="e.g. Apex Feed Mills" value={inboundSupplier} onChange={(e) => setInboundSupplier(e.target.value)} className="w-full h-10 rounded-lg border border-surface-200 bg-white px-3 text-xs font-semibold text-surface-900 outline-none dark:border-white/10 dark:bg-slate-950 dark:text-white" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-surface-700 dark:text-slate-300">Min Alert Stock (kg)</label>
                    <input type="number" min="1" placeholder="e.g. 100" value={inboundMinStock} onChange={(e) => setInboundMinStock(e.target.value)} className="w-full h-10 rounded-lg border border-surface-200 bg-white px-3 text-xs font-semibold text-surface-900 outline-none dark:border-white/10 dark:bg-slate-950 dark:text-white" />
                  </div>
                </div>

                <div className="border-t border-surface-100 dark:border-white/5 pt-4 mt-6 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowInboundModal(false)} className="h-9 px-4 rounded-lg border border-surface-200 dark:border-white/10 bg-white/5 text-xs font-black uppercase tracking-wider text-surface-700 dark:text-slate-300 hover:bg-white/10 transition">Cancel</button>
                  <button type="submit" className="h-9 px-4 rounded-lg bg-emerald-500 text-xs font-black uppercase tracking-wider text-white hover:bg-emerald-600 transition">Replenish Silo</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Outbound feeding Modal */}
      <AnimatePresence>
        {showOutboundModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowOutboundModal(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative z-10 w-full max-w-md rounded-xl border border-surface-200 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-slate-900 dark:text-white">
              <div className="flex items-center justify-between border-b border-surface-100 pb-3 mb-4 dark:border-white/5">
                <h3 className="font-heading text-sm font-black uppercase tracking-wider text-surface-950 dark:text-white flex items-center gap-1.5">
                  <Wheat className="h-4 w-4 text-emerald-500" />
                  Log Outbound Feed Run
                </h3>
                <button type="button" onClick={() => setShowOutboundModal(false)} className="text-surface-400 hover:text-white transition"><X className="h-4.5 w-4.5" /></button>
              </div>

              <form onSubmit={handleAddOutbound} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-surface-700 dark:text-slate-300">Feed Type</label>
                  <select value={outboundType} onChange={(e) => setOutboundType(e.target.value)} className="w-full h-10 rounded-lg border border-surface-200 bg-white px-3 text-xs font-semibold text-surface-900 outline-none dark:border-white/10 dark:bg-slate-950 dark:text-white">
                    {stockLevels.map((s) => (
                      <option key={s.type} value={s.type}>{s.type} ({s.remaining} kg in stock)</option>
                    ))}
                    {stockLevels.length === 0 && (
                      <>
                        <option value="Layer Mash">Layer Mash</option>
                        <option value="Broiler Starter">Broiler Starter</option>
                        <option value="Finisher Feed">Finisher Feed</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-surface-700 dark:text-slate-300">Volume (kg)</label>
                    <input type="number" required min="1" placeholder="e.g. 50" value={outboundQty} onChange={(e) => setOutboundQty(e.target.value)} className="w-full h-10 rounded-lg border border-surface-200 bg-white px-3 text-xs font-semibold text-surface-900 outline-none dark:border-white/10 dark:bg-slate-950 dark:text-white" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-surface-700 dark:text-slate-300">Log to Flock</label>
                    <select value={outboundFlockId} onChange={(e) => setOutboundFlockId(e.target.value)} className="w-full h-10 rounded-lg border border-surface-200 bg-white px-3 text-xs font-semibold text-surface-900 outline-none dark:border-white/10 dark:bg-slate-950 dark:text-white">
                      <option value="general">General (Unlinked)</option>
                      {flocks.map((f) => (
                        <option key={f.id} value={f.id}>Flock #{f.id.slice(-4).toUpperCase()} ({f.breed})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-surface-700 dark:text-slate-300">Notes / Details</label>
                  <textarea placeholder="e.g. Daily mash run for layer coop" value={outboundNotes} onChange={(e) => setOutboundNotes(e.target.value)} className="w-full h-20 rounded-lg border border-surface-200 bg-white p-3 text-xs font-semibold text-surface-900 outline-none dark:border-white/10 dark:bg-slate-950 dark:text-white resize-none" />
                </div>

                <div className="border-t border-surface-100 dark:border-white/5 pt-4 mt-6 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowOutboundModal(false)} className="h-9 px-4 rounded-lg border border-surface-200 dark:border-white/10 bg-white/5 text-xs font-black uppercase tracking-wider text-surface-700 dark:text-slate-300 hover:bg-white/10 transition">Cancel</button>
                  <button type="submit" className="h-9 px-4 rounded-lg bg-emerald-500 text-xs font-black uppercase tracking-wider text-white hover:bg-emerald-600 transition">Log Feed Run</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </AppShell>
  )
}

// Inline Close SVG Icon helper since X is imported but sometimes needs custom style
function XIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}
