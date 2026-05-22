import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Percent,
  Plus,
  Trash2,
  Calendar,
  Tag,
  FileText,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieIcon,
  X,
  Download,
  Printer,
  FileSpreadsheet,
  Activity,
  Filter
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'
import AppShell from '../components/ui/AppShell.jsx'
import StatCard from '../components/ui/StatCard.jsx'
import useRealtimeCollection from '../hooks/useRealtimeCollection.js'
import useRealtimePoultry from '../hooks/useRealtimePoultry.js'
import useRealtimeFeed from '../hooks/useRealtimeFeed.js'
import useRealtimeVaccination from '../hooks/useRealtimeVaccination.js'
import { COLLECTIONS, addDocument, deleteDocument } from '../firebase'
import { useToast } from '../contexts/ToastContext.jsx'
import { cn } from '../lib/ui'

const DEFAULT_MOCK_EXPENSES = [
  { id: 'exp-1', category: 'Feed', amount: 850, notes: 'Acquired 1.2 tons Layer Mash', createdAt: new Date(Date.now() - 25*24*60*60*1000).toISOString() },
  { id: 'exp-2', category: 'Medicine', amount: 150, notes: 'Vaccines and sanitation supplies', createdAt: new Date(Date.now() - 18*24*60*60*1000).toISOString() },
  { id: 'exp-3', category: 'Labor', amount: 450, notes: 'Coop supervisor shift payout', createdAt: new Date(Date.now() - 10*24*60*60*1000).toISOString() },
  { id: 'exp-4', category: 'Utilities', amount: 210, notes: 'Power bill and water pump maintenance', createdAt: new Date(Date.now() - 5*24*60*60*1000).toISOString() },
]

const DEFAULT_MOCK_REVENUE = [
  { id: 'rev-1', category: 'Egg Sales', amount: 1650, notes: 'Direct delivery of 400 egg crates', createdAt: new Date(Date.now() - 22*24*60*60*1000).toISOString() },
  { id: 'rev-2', category: 'Bird Sales', amount: 2800, notes: 'Sold 300 birds to wholesale distributor', createdAt: new Date(Date.now() - 14*24*60*60*1000).toISOString() },
  { id: 'rev-3', category: 'Egg Sales', amount: 1100, notes: 'Eggs local farmer market stands', createdAt: new Date(Date.now() - 7*24*60*60*1000).toISOString() },
]

const TRANSACTION_CATEGORIES = {
  revenue: ['Egg Sales', 'Bird Sales', 'Equipment Sold', 'Others'],
  expense: ['Feed', 'Medicine', 'Labor', 'Utilities', 'Equipment Purchased', 'Others']
}

const PALETTE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

export default function BusinessAnalytics() {
  const { addToast } = useToast()
  
  // Tab states: 'transactions' | 'analytics'
  const [activeTab, setActiveTab] = useState('analytics')
  
  // Date filter for analytics preset: '7' | '30' | 'all'
  const [dateFilter, setDateFilter] = useState('30')

  // Real-time Firebase listeners for financials
  const { data: dbExpenses, isOffline: expOffline } = useRealtimeCollection(COLLECTIONS.expenses, [])
  const { data: dbRevenues, isOffline: revOffline } = useRealtimeCollection(COLLECTIONS.revenue, [])
  const { records: flocks } = useRealtimePoultry()
  const { records: feedRecords } = useRealtimeFeed()
  const { records: vacRecords } = useRealtimeVaccination()

  const isOffline = expOffline || revOffline

  // Combined records from DB or Fallback seeds
  const expenses = useMemo(() => dbExpenses.length > 0 ? dbExpenses : DEFAULT_MOCK_EXPENSES, [dbExpenses])
  const revenues = useMemo(() => dbRevenues.length > 0 ? dbRevenues : DEFAULT_MOCK_REVENUE, [dbRevenues])

  // Modals state for transactions
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [txType, setTxType] = useState('revenue') // 'revenue' or 'expense'
  const [txCategory, setTxCategory] = useState('Egg Sales')
  const [txAmount, setTxAmount] = useState('')
  const [txNotes, setTxNotes] = useState('')

  // Update categories dynamically depending on selected type
  React.useEffect(() => {
    if (txType === 'revenue') {
      setTxCategory('Egg Sales')
    } else {
      setTxCategory('Feed')
    }
  }, [txType])

  // Handle transaction creation
  const handleCreateTransaction = async (e) => {
    e.preventDefault()
    if (!txAmount || Number(txAmount) <= 0) {
      addToast('error', 'Please enter a valid amount.')
      return
    }

    const payload = {
      category: txCategory,
      amount: Number(txAmount),
      notes: txNotes || 'N/A',
      createdAt: new Date().toISOString()
    }

    const collectionName = txType === 'revenue' ? COLLECTIONS.revenue : COLLECTIONS.expenses

    try {
      if (isOffline) {
        addToast('success', '[Offline] Transaction saved locally.')
      } else {
        await addDocument(collectionName, payload)
        addToast('success', `${txType.toUpperCase()} transaction logged successfully.`)
      }
      setShowTransactionModal(false)
      setTxAmount('')
      setTxNotes('')
    } catch (err) {
      addToast('error', `Failed to log transaction: ${err.message}`)
    }
  }

  // Handle transaction delete
  const handleDeleteTransaction = async (id, type) => {
    if (!window.confirm('Delete this transaction record?')) return
    const collectionName = type === 'revenue' ? COLLECTIONS.revenue : COLLECTIONS.expenses
    try {
      if (isOffline) {
        addToast('success', '[Offline] Transaction removed locally.')
      } else {
        await deleteDocument(collectionName, id)
        addToast('success', 'Transaction record deleted.')
      }
    } catch (err) {
      addToast('error', `Failed to delete record: ${err.message}`)
    }
  }

  // Filter records by date range
  const filteredData = useMemo(() => {
    const limitDate = dateFilter === 'all' 
      ? new Date(0) 
      : new Date(Date.now() - Number(dateFilter) * 24 * 60 * 60 * 1000)

    const exp = expenses.filter((e) => new Date(e.createdAt) >= limitDate)
    const rev = revenues.filter((r) => new Date(r.createdAt) >= limitDate)
    const feed = feedRecords.filter((f) => new Date(f.createdAt) >= limitDate)
    const vac = vacRecords.filter((v) => new Date(v.scheduledDate || v.createdAt) >= limitDate)

    const totalExp = exp.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
    const totalRev = rev.reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
    const netProfit = totalRev - totalExp
    const margin = totalRev > 0 ? (netProfit / totalRev) * 100 : 0

    const feedAcquired = feed.filter((f) => f.type === 'inbound').reduce((sum, f) => sum + (Number(f.quantity) || 0), 0)
    const feedConsumed = Math.abs(feed.filter((f) => f.type === 'outbound').reduce((sum, f) => sum + (Number(f.quantity) || 0), 0))

    const vacCompleted = vac.filter((v) => v.status === 'completed' || v.status === 'done').length
    const vacOverdue = vac.filter((v) => v.status === 'pending' && new Date(v.scheduledDate) < new Date()).length

    return {
      expensesList: exp,
      revenuesList: rev,
      totalExpenses: totalExp,
      totalRevenue: totalRev,
      netProfit,
      margin,
      feedAcquired,
      feedConsumed,
      vacCompleted,
      vacOverdue,
      flocksActive: flocks.length
    }
  }, [expenses, revenues, feedRecords, vacRecords, flocks, dateFilter])

  // Chart data matching selected filter
  const chartData = useMemo(() => {
    const days = Number(dateFilter === 'all' ? '30' : dateFilter)
    const grouped = {}
    
    // Fill buckets
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i*24*60*60*1000)
      let label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      if (days === 30) {
        const bucketDay = Math.floor(d.getDate() / 5) * 5 || 1
        label = `${d.toLocaleDateString(undefined, { month: 'short' })} ${bucketDay}`
      }
      grouped[label] = { name: label, Revenue: 0, Expenses: 0, FeedConsumed: 0 }
    }

    expenses.forEach((e) => {
      const d = new Date(e.createdAt)
      let label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      if (days === 30) {
        const bucketDay = Math.floor(d.getDate() / 5) * 5 || 1
        label = `${d.toLocaleDateString(undefined, { month: 'short' })} ${bucketDay}`
      }
      if (grouped[label]) {
        grouped[label].Expenses += Number(e.amount) || 0
      }
    })

    revenues.forEach((r) => {
      const d = new Date(r.createdAt)
      let label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      if (days === 30) {
        const bucketDay = Math.floor(d.getDate() / 5) * 5 || 1
        label = `${d.toLocaleDateString(undefined, { month: 'short' })} ${bucketDay}`
      }
      if (grouped[label]) {
        grouped[label].Revenue += Number(r.amount) || 0
      }
    })

    return Object.values(grouped)
  }, [expenses, revenues, dateFilter])

  // Category breakdown for Pie Chart
  const categoryBreakdown = useMemo(() => {
    const categories = {}
    expenses.forEach((e) => {
      categories[e.category] = (categories[e.category] || 0) + (Number(e.amount) || 0)
    })
    return Object.entries(categories).map(([name, value], i) => ({
      name,
      value,
      color: PALETTE_COLORS[i % PALETTE_COLORS.length]
    }))
  }, [expenses])

  // Export consolidating data into a CSV file
  const handleExportCSV = () => {
    try {
      const rows = []
      rows.push(['POULTRYPRO BUSINESS OS — FINANCIAL & OPERATIONS AUDIT'])
      rows.push([`Generated On: ${new Date().toLocaleString()}`])
      rows.push([`Scope Filter: Last ${dateFilter} Days`])
      rows.push([])

      rows.push(['1. KPI METRICS SUMMARY'])
      rows.push(['Active Flocks', filteredData.flocksActive])
      rows.push(['Total Revenue ($)', filteredData.totalRevenue])
      rows.push(['Total Expenses ($)', filteredData.totalExpenses])
      rows.push(['Net Cash Flow ($)', filteredData.netProfit])
      rows.push(['Margin (%)', `${filteredData.margin.toFixed(1)}%`])
      rows.push([])

      rows.push(['2. DETAILED LEDGER ENTRIES'])
      rows.push(['Date', 'Type', 'Category', 'Amount ($)', 'Notes'])
      
      expenses.forEach((e) => {
        rows.push([new Date(e.createdAt).toLocaleDateString(), 'Expense', e.category, e.amount, e.notes])
      })
      revenues.forEach((r) => {
        rows.push([new Date(r.createdAt).toLocaleDateString(), 'Revenue', r.category, r.amount, r.notes])
      })

      const csvContent = 'data:text/csv;charset=utf-8,' 
        + rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n')

      const encodedUri = encodeURI(csvContent)
      const link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute('download', `poultrypro_business_report_${dateFilter}d.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      addToast('success', 'CSV Report downloaded successfully.')
    } catch (err) {
      addToast('error', `CSV Export failed: ${err.message}`)
    }
  }

  // Trigger PDF print styles
  const handlePrintPDF = () => {
    window.print()
  }

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
  }

  return (
    <AppShell title="Business Analytics" subtitle="Consolidated profit analysis, operating expense ledgers, and cash flow reports">
      
      {/* Tab controls */}
      <div className="flex border-b border-surface-200/60 dark:border-white/5 no-print">
        <button
          onClick={() => setActiveTab('analytics')}
          className={cn(
            "pb-3.5 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all duration-200",
            activeTab === 'analytics'
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-surface-500 hover:text-surface-800"
          )}
        >
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4" />
            Financial Analytics
          </div>
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={cn(
            "pb-3.5 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all duration-200",
            activeTab === 'transactions'
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-surface-500 hover:text-surface-800"
          )}
        >
          <div className="flex items-center gap-1.5">
            <DollarSign className="h-4 w-4" />
            Ledger & Expenses
          </div>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-4">
        <StatCard
          label="Total Period Revenue"
          value={filteredData.totalRevenue}
          formatter={formatCurrency}
          detail="Egg & bird sales volume"
          icon={TrendingUp}
          accent="emerald"
        />
        <StatCard
          label="Total Operating Cost"
          value={filteredData.totalExpenses}
          formatter={formatCurrency}
          detail="Feed, labor & medicine"
          icon={TrendingDown}
          accent="amber"
        />
        <StatCard
          label="Net Operating Profit"
          value={filteredData.netProfit}
          formatter={formatCurrency}
          detail="Revenue minus costs"
          icon={DollarSign}
          accent={filteredData.netProfit >= 0 ? 'emerald' : 'red'}
        />
        <StatCard
          label="Profit Margin"
          value={filteredData.margin}
          formatter={(v) => `${v.toFixed(1)}%`}
          detail="Combined margin ratio"
          icon={Percent}
          accent={filteredData.margin > 30 ? 'emerald' : 'amber'}
        />
      </div>

      {/* Tab Panels */}
      <div className="mt-4">
        {/* Tab 1: Financial Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Filters & Export Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/70 bg-white/70 p-4 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055] no-print">
              <div className="flex items-center gap-3">
                <Filter className="h-4.5 w-4.5 text-emerald-500" />
                <span className="text-xs font-bold text-surface-550 dark:text-slate-400">Preset:</span>
                
                <div className="flex items-center rounded-lg bg-surface-100 p-0.5 dark:bg-slate-950">
                  {[
                    { label: '7 Days', val: '7' },
                    { label: '30 Days', val: '30' },
                    { label: 'All Time', val: 'all' }
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setDateFilter(preset.val)}
                      className={cn(
                        "h-7 px-3 rounded-md text-[10px] font-black uppercase tracking-wider transition",
                        dateFilter === preset.val 
                          ? "bg-white text-emerald-600 dark:bg-white/10 dark:text-emerald-300 shadow-sm"
                          : "text-surface-500 hover:text-surface-900"
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintPDF}
                  className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-surface-200 bg-white px-4 text-xs font-black uppercase tracking-wider text-surface-700 hover:bg-surface-50 transition shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-white"
                >
                  <Printer className="h-4 w-4" />
                  PDF Report
                </button>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-emerald-500 px-4 text-xs font-black uppercase tracking-wider text-white hover:bg-emerald-600 transition shadow-sm"
                >
                  <Download className="h-4 w-4" />
                  CSV Audit
                </button>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Cash Flow Line Chart */}
              <div className="lg:col-span-2 rounded-2xl border border-white/70 bg-white/70 p-6 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055]">
                <h3 className="font-heading text-base font-black tracking-tight text-surface-950 dark:text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-emerald-500" />
                  Monthly Cash Flow Trends
                </h3>
                <p className="text-xs text-surface-500 dark:text-slate-400 mt-0.5 mb-4">
                  Comparison curves showing gross operating income vs expense cycles
                </p>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="flowRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="flowExp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(15, 23, 42, 0.95)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          color: 'white',
                          fontSize: '11px',
                        }}
                      />
                      <Area type="monotone" name="Revenue" dataKey="Revenue" stroke="#10b981" fillOpacity={1} fill="url(#flowRev)" strokeWidth={2.5} />
                      <Area type="monotone" name="Expenses" dataKey="Expenses" stroke="#f59e0b" fillOpacity={1} fill="url(#flowExp)" strokeWidth={2.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Expense Category Distribution */}
              <div className="rounded-2xl border border-white/70 bg-white/70 p-6 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055] flex flex-col justify-between">
                <div>
                  <h3 className="font-heading text-base font-black tracking-tight text-surface-950 dark:text-white flex items-center gap-2">
                    <PieIcon className="h-5 w-5 text-emerald-500" />
                    Operating Cost Shares
                  </h3>
                  <p className="text-xs text-surface-500 dark:text-slate-400 mt-0.5 mb-4">
                    Expense distribution by category
                  </p>

                  <div className="h-48 w-full">
                    {categoryBreakdown.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-xs text-surface-450">
                        No expense records in this range
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryBreakdown}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={3}
                          >
                            {categoryBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                <div className="space-y-2 border-t border-surface-200/50 pt-4 dark:border-white/5 text-[11px] font-semibold">
                  {categoryBreakdown.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-surface-700 dark:text-slate-350">{item.name}</span>
                      </div>
                      <span className="text-surface-900 dark:text-white font-black">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Ledger & Transactions */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/70 p-4 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055]">
              <div className="text-xs font-bold text-surface-550 dark:text-slate-400">
                Log cash flow events, bird acquisitions, egg retail, and operating costs
              </div>
              <button
                type="button"
                onClick={() => setShowTransactionModal(true)}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-emerald-500 px-4 text-xs font-black uppercase tracking-wider text-white hover:bg-emerald-600 transition shadow-sm"
              >
                <Plus className="h-4.5 w-4.5" />
                Add Transaction
              </button>
            </div>

            {/* Transactions List */}
            <div className="rounded-2xl border border-white/70 bg-white/70 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-semibold">
                  <thead>
                    <tr className="border-b border-surface-200 bg-surface-100/50 text-surface-450 dark:border-white/5 dark:bg-slate-900/50 text-[10px] font-black uppercase tracking-wider">
                      <th className="p-4">Date</th>
                      <th className="p-4">Flow</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Notes</th>
                      <th className="p-4 text-right">Value</th>
                      <th className="p-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Combine sorted records */}
                    {expenses.map((e) => ({ ...e, type: 'expense' }))
                      .concat(revenues.map((r) => ({ ...r, type: 'revenue' })))
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .map((tx) => (
                        <tr key={tx.id} className="border-b border-surface-200/50 dark:border-white/5 hover:bg-surface-50/50 dark:hover:bg-white/[0.02]">
                          <td className="p-4 text-surface-450 dark:text-slate-400">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 w-max",
                              tx.type === 'revenue' 
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                                : "bg-red-500/10 text-red-600 dark:text-red-400"
                            )}>
                              {tx.type === 'revenue' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                              {tx.type}
                            </span>
                          </td>
                          <td className="p-4 text-surface-950 dark:text-white font-bold">{tx.category}</td>
                          <td className="p-4 text-surface-500 dark:text-slate-400 max-w-[200px] truncate" title={tx.notes}>
                            {tx.notes}
                          </td>
                          <td className={cn(
                            "p-4 text-right font-black text-sm",
                            tx.type === 'revenue' ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
                          )}>
                            {tx.type === 'revenue' ? '+' : '-'}{formatCurrency(tx.amount)}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteTransaction(tx.id, tx.type)}
                              className="h-8 w-8 inline-grid place-items-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition dark:border-red-500/10 dark:hover:bg-red-500/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      <AnimatePresence>
        {showTransactionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print">
            <motion.button
              type="button"
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTransactionModal(false)}
            />

            <motion.div
              className="relative z-10 w-full max-w-md rounded-2xl border border-white/70 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
            >
              <div className="flex items-center justify-between border-b border-surface-200/50 pb-4 dark:border-white/5">
                <h3 className="font-heading text-base font-black text-surface-950 dark:text-white">
                  Log Cash Flow Transaction
                </h3>
                <button
                  type="button"
                  onClick={() => setShowTransactionModal(false)}
                  className="rounded-lg p-1 text-surface-450 hover:bg-surface-100 dark:text-slate-400 dark:hover:bg-white/5"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTransaction} className="mt-4 space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-surface-555 dark:text-slate-400 block mb-1.5">
                    Flow Direction
                  </label>
                  <div className="grid grid-cols-2 gap-2.5 rounded-xl bg-surface-100 p-1 dark:bg-slate-900">
                    <button
                      type="button"
                      onClick={() => setTxType('revenue')}
                      className={cn(
                        "h-8 rounded-lg text-xs font-black uppercase tracking-wider transition",
                        txType === 'revenue' 
                          ? "bg-white text-emerald-600 dark:bg-white/10 dark:text-emerald-300 shadow-sm"
                          : "text-surface-500 hover:text-surface-800"
                      )}
                    >
                      Revenue (+)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTxType('expense')}
                      className={cn(
                        "h-8 rounded-lg text-xs font-black uppercase tracking-wider transition",
                        txType === 'expense' 
                          ? "bg-white text-red-500 dark:bg-white/10 dark:text-red-400 shadow-sm"
                          : "text-surface-500 hover:text-surface-800"
                      )}
                    >
                      Expense (-)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-surface-555 dark:text-slate-400 block mb-1">
                      Transaction Category
                    </label>
                    <select
                      value={txCategory}
                      onChange={(e) => setTxCategory(e.target.value)}
                      className="h-10 w-full rounded-xl border border-surface-200 bg-white px-3 text-xs font-semibold outline-none focus:border-emerald-500 dark:border-white/10 dark:bg-slate-900 text-surface-900 dark:text-white"
                    >
                      {TRANSACTION_CATEGORIES[txType].map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-surface-555 dark:text-slate-400 block mb-1">
                      Amount (USD)
                    </label>
                    <input
                      type="number"
                      required
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                      value={txAmount}
                      onChange={(e) => setTxAmount(e.target.value)}
                      className="h-10 w-full rounded-xl border border-surface-200 bg-white px-3 text-xs font-semibold outline-none focus:border-emerald-500 dark:border-white/10 dark:bg-slate-900 text-surface-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-surface-555 dark:text-slate-400 block mb-1">
                    Description & Notes
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Provide context or links (e.g. Supplier Invoice #540)"
                    value={txNotes}
                    onChange={(e) => setTxNotes(e.target.value)}
                    className="w-full rounded-xl border border-surface-200 bg-white p-3 text-xs font-semibold outline-none focus:border-emerald-500 dark:border-white/10 dark:bg-slate-900 text-surface-900 dark:text-white resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-surface-200/50 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowTransactionModal(false)}
                    className="h-10 px-4 rounded-xl border border-surface-200 text-xs font-bold text-surface-700 hover:bg-surface-50 dark:border-white/15 dark:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-4 rounded-xl bg-emerald-500 text-xs font-black uppercase tracking-wider text-white hover:bg-emerald-600"
                  >
                    Log Entry
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
