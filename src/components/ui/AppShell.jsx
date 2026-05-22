import React, { useEffect, useState, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  House,
  Warehouse,
  Brain,
  ThermometerSun,
  CalendarClock,
  BarChart3,
  ShoppingCart,
  Camera,
  Cpu,
  Settings,
  ChevronLeft,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  Search,
} from 'lucide-react'
import { auth, signOut } from '../../firebase'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useNotifications } from '../../contexts/NotificationContext.jsx'
import useRealtimeAlerts from '../../hooks/useRealtimeAlerts.js'
import useRealtimeVaccination from '../../hooks/useRealtimeVaccination.js'
import { cn, getInitials } from '../../lib/ui'
import BrandMark from './BrandMark.jsx'
import HeaderBar from './HeaderBar.jsx'
import SidebarItem from './SidebarItem.jsx'

export default function AppShell({ title, subtitle, actions, children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  
  // Realtime notification & alert hooks for badges
  const { unreadCount } = useNotifications()
  const { grouped: alertsGrouped } = useRealtimeAlerts()
  const { records: vaccinationRecords } = useRealtimeVaccination()
  
  const pendingVaccinesCount = useMemo(() => {
    return vaccinationRecords?.filter(v => v.status === 'pending' || v.status === 'scheduled').length || 0
  }, [vaccinationRecords])

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => {
    try { return window.localStorage.getItem('poultrypro-sidebar-collapsed') === 'true' } catch { return false }
  })
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const handler = (e) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Farmer'
  const userInitials = getInitials(displayName)

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/login')
  }

  // Sidebar Grouped Structure
  const navGroups = useMemo(() => [
    {
      title: 'Operations',
      items: [
        { icon: House, label: 'Command Center', path: '/dashboard', badge: unreadCount },
        { icon: Warehouse, label: 'Poultry Manager', path: '/poultry-manager' },
        { icon: ThermometerSun, label: 'Smart Environment', path: '/smart-environment', badge: alertsGrouped?.critical?.length || 0 },
        { icon: CalendarClock, label: 'Smart Scheduling', path: '/smart-scheduling', badge: pendingVaccinesCount },
      ]
    },
    {
      title: 'AI Intelligence',
      items: [
        { icon: Brain, label: 'AI Health Intel', path: '/health-intel' },
        { icon: Camera, label: 'AI Disease Scanner', path: '/disease-scanner' },
      ]
    },
    {
      title: 'Market & Automation',
      items: [
        { icon: BarChart3, label: 'Business Analytics', path: '/business-analytics' },
        { icon: ShoppingCart, label: 'Farm Marketplace', path: '/marketplace' },
        { icon: Cpu, label: 'Smart Automation', path: '/smart-automation' },
      ]
    },
    {
      title: 'System',
      items: [
        { icon: Settings, label: 'User & Farm Settings', path: '/settings' },
      ]
    }
  ], [unreadCount, alertsGrouped, pendingVaccinesCount])

  // Filter groups by search query
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return navGroups
    return navGroups.map(group => {
      const items = group.items.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
      return { ...group, items }
    }).filter(group => group.items.length > 0)
  }, [navGroups, searchQuery])

  // Mobile Bottom Bar Navigation (5 key actions)
  const mobileNavItems = useMemo(() => [
    { icon: House, label: 'Command', path: '/dashboard' },
    { icon: Warehouse, label: 'Poultry', path: '/poultry-manager' },
    { icon: Brain, label: 'AI Intel', path: '/health-intel' },
    { icon: Camera, label: 'Scanner', path: '/disease-scanner' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ], [])

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_30%),linear-gradient(135deg,#f8fafc,#ffffff,#ecfdf5)] text-surface-900 dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.20),transparent_34%),linear-gradient(135deg,#020617,#052e16_48%,#0f172a)] dark:text-white transition-colors duration-300">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 z-45 bg-slate-950/60 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        layout
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/60 bg-white/70 shadow-2xl shadow-emerald-950/5 backdrop-blur-2xl transition-all duration-300 dark:border-white/10 dark:bg-slate-950/75 lg:translate-x-0',
          collapsed ? 'w-24' : 'w-72',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between gap-3 border-b border-surface-200/50 p-4 dark:border-white/5">
          <BrandMark collapsed={collapsed} />
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="grid h-9 w-9 place-items-center rounded-xl border border-surface-200 bg-white text-surface-555 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300 lg:hidden"
            aria-label="Close navigation"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setCollapsed((value) => {
              const next = !value
              try { window.localStorage.setItem('poultrypro-sidebar-collapsed', String(next)) } catch {}
              return next
            })}
            className="hidden h-9 w-9 place-items-center rounded-xl border border-surface-200 bg-white text-surface-555 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 lg:grid"
            aria-label="Collapse navigation"
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>

        {/* Sidebar Search */}
        {!collapsed && (
          <div className="relative mx-4 mt-4">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-surface-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-xl border border-surface-200/60 bg-white/50 pl-9 pr-3 text-xs font-semibold text-surface-900 placeholder:text-surface-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-white/5 dark:bg-slate-900/50 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-950 transition-all duration-300"
            />
          </div>
        )}

        {/* Navigation list */}
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4 scrollbar-thin">
          {filteredGroups.map((group, groupIdx) => (
            <div key={group.title} className="space-y-1.5">
              {!collapsed && (
                <div className="px-4 py-1 text-[10px] font-black uppercase tracking-wider text-surface-400 dark:text-slate-500">
                  {group.title}
                </div>
              )}
              {collapsed && groupIdx > 0 && (
                <div className="my-2 border-t border-surface-200/30 dark:border-white/5" />
              )}
              {group.items.map((item) => (
                <SidebarItem
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  active={item.path === location.pathname}
                  collapsed={collapsed}
                  badge={item.badge}
                  onClick={() => {
                    navigate(item.path)
                    setSidebarOpen(false)
                  }}
                />
              ))}
            </div>
          ))}

          {filteredGroups.length === 0 && (
            <div className="px-4 py-8 text-center text-xs font-semibold text-surface-400 dark:text-slate-500">
              No modules found
            </div>
          )}
        </nav>

        {/* User Card & Logout Footer */}
        <div className="border-t border-surface-200/50 p-3 dark:border-white/5">
          <div className={cn('mb-3 rounded-xl border border-emerald-200/70 bg-emerald-50/80 p-3 dark:border-emerald-400/15 dark:bg-emerald-400/10', collapsed && 'px-2')}>
            <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-800 text-sm font-black text-white shadow-lg shadow-emerald-700/20">
                {userInitials}
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-surface-900 dark:text-white">{displayName}</p>
                  <p className="truncate text-xs text-surface-500 dark:text-slate-400">{user?.email}</p>
                </div>
              )}
            </div>
            {!collapsed && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/80 px-2.5 py-2 text-xs font-semibold text-emerald-700 dark:bg-white/5 dark:text-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5" />
                AgriOS Cloud Connected
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10',
              collapsed && 'justify-center px-2'
            )}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && 'Sign out'}
          </button>
        </div>
      </motion.aside>

      <div
        className="min-h-screen transition-[padding] duration-300 pb-20 lg:pb-0"
        style={{ paddingLeft: isDesktop ? (collapsed ? '6rem' : '18rem') : '0' }}
      >
        <HeaderBar
          title={title}
          subtitle={subtitle}
          onMenuClick={() => setSidebarOpen(true)}
          actions={actions}
          userInitials={userInitials}
        />
        <main className="relative mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-x-4 top-4 h-40 rounded-lg border border-white/50 bg-white/20 blur-3xl dark:border-white/10 dark:bg-emerald-400/5" />
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative z-10 flex flex-col gap-6"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Mobile Sticky Bottom Tab Navigation */}
      <div className="fixed bottom-0 inset-x-0 z-40 h-16 border-t border-surface-200/80 bg-white/85 shadow-lg backdrop-blur-lg dark:border-white/10 dark:bg-slate-950/85 flex items-center justify-around px-2 pb-safe lg:hidden">
        {mobileNavItems.map((item) => {
          const Icon = item.icon
          const isActive = item.path === location.pathname
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => item.path && navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-14 h-12 rounded-lg transition",
                isActive 
                  ? "text-emerald-600 dark:text-emerald-400 font-bold scale-105" 
                  : "text-surface-450 hover:text-surface-900 dark:text-slate-400 dark:hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[9px] font-semibold">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
