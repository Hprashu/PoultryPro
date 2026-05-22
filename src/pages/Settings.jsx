import React, { useState } from 'react'
import {
  User,
  Building,
  Sliders,
  Bell,
  Database,
  Moon,
  Sun,
  ShieldAlert,
  Save,
  CheckCircle2,
  Lock,
  Globe,
  Upload,
  Phone,
  Mail,
  MapPin
} from 'lucide-react'
import AppShell from '../components/ui/AppShell.jsx'
import { useToast } from '../contexts/ToastContext.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { cn } from '../lib/ui'

export default function Settings() {
  const { showToast } = useToast()
  const { theme, toggleTheme, isDark } = useTheme()
  const { user } = useAuth()

  const [activeTab, setActiveTab] = useState('profile')

  // User Profile Form State
  const [profileForm, setProfileForm] = useState({
    displayName: user?.displayName || user?.email?.split('@')[0] || 'PoultryPro Farmer',
    email: user?.email || 'farmer@poultrypro.ai',
    phone: '+1 (555) 382-9901',
    location: 'Shed 3, Sector B, AgriValley Farms',
  })

  // Farm Configuration State
  const [farmForm, setFarmForm] = useState({
    farmName: 'AgriValley Farms Ltd',
    totalSheds: 4,
    primaryBreed: 'Cobb 500 Broiler',
    capacity: 25000,
    lowFeedThreshold: 20, // bags
  })

  // Alert Config State
  const [alertConfig, setAlertConfig] = useState({
    tempMin: 18.0,
    tempMax: 32.0,
    ammoniaAlert: 15.0,
    enablePush: true,
    enableEmail: false,
    enableSms: true,
  })

  const handleSaveProfile = (e) => {
    e.preventDefault()
    showToast('Profile settings updated successfully!', 'success')
  }

  const handleSaveFarm = (e) => {
    e.preventDefault()
    showToast('Farm configuration synced to cloud database.', 'success')
  }

  const handleSaveAlerts = (e) => {
    e.preventDefault()
    showToast('Alarm thresholds and communication settings saved.', 'success')
  }

  const handleDatabaseBackup = () => {
    showToast('Initiating secure cloud database backup...', 'info')
    setTimeout(() => {
      showToast('Database backup successfully generated (agrios_backup_2026.sql)', 'success')
    }, 2000)
  }

  const tabs = [
    { id: 'profile', label: 'Farmer Profile', icon: User },
    { id: 'farm', label: 'Farm Configuration', icon: Building },
    { id: 'alerts', label: 'Siren & Alarms Config', icon: Bell },
    { id: 'security', label: 'Cloud & Database', icon: Database },
  ]

  return (
    <AppShell title="User & Farm Settings" subtitle="Modify user credentials, adjust microclimate alarm sirens, change display themes, and manage secure cloud backups">
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        
        {/* Left Side Tab Navigation */}
        <div className="rounded-2xl border border-white/70 bg-white/70 p-4.5 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055] space-y-1.5 h-fit">
          <span className="text-[10px] font-black uppercase tracking-wider text-surface-400 dark:text-slate-500 px-3.5 block mb-2">Settings Sections</span>
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition text-left",
                  isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/15"
                    : "text-surface-650 hover:bg-white dark:text-slate-350 dark:hover:bg-white/5"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {tab.label}
              </button>
            )
          })}

          <div className="my-4 border-t border-surface-200/50 dark:border-white/5" />

          {/* Core Theme Toggle inside sidebar settings card */}
          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/45 dark:bg-white/[0.02] border border-surface-200/50 dark:border-white/5">
            <span className="text-xs font-bold text-surface-650 dark:text-slate-350 flex items-center gap-2">
              {isDark ? <Moon className="h-4 w-4 text-emerald-500" /> : <Sun className="h-4 w-4 text-orange-500" />}
              Dark Theme
            </span>
            <button
              onClick={toggleTheme}
              className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-surface-250 transition-colors duration-200 ease-in-out focus:outline-none dark:bg-emerald-500"
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                  isDark ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>
        </div>

        {/* Right Side Content Panel */}
        <div className="lg:col-span-3">
          
          {/* Profile Tab Panel */}
          {activeTab === 'profile' && (
            <div className="rounded-2xl border border-white/70 bg-white/70 p-6 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055] animate-in fade-in slide-in-from-right-3 duration-250">
              <h3 className="font-heading text-base font-black tracking-tight text-surface-950 dark:text-white flex items-center gap-2 border-b border-surface-200/50 pb-4 dark:border-white/5 mb-5">
                <User className="h-5 w-5 text-emerald-500" />
                Farmer Profile Credentials
              </h3>

              <form onSubmit={handleSaveProfile} className="space-y-5">
                
                {/* Profile Photo Row */}
                <div className="flex flex-wrap items-center gap-4.5 bg-white/45 dark:bg-white/[0.02] border border-surface-200/50 dark:border-white/5 p-4 rounded-2xl">
                  <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-800 text-lg font-black text-white shadow-xl shadow-emerald-700/10">
                    {profileForm.displayName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-surface-950 dark:text-white uppercase tracking-wider">Avatar Matrix</h4>
                    <p className="text-[10px] text-surface-500 dark:text-slate-400 mt-0.5">Custom avatars sync across devices</p>
                    <button
                      type="button"
                      onClick={() => showToast('Avatar upload available in Cloud premium tier.', 'info')}
                      className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-450 hover:underline flex items-center gap-1"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Upload Photo
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-surface-500 dark:text-slate-400 block mb-1">Display Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-surface-400 dark:text-slate-500" />
                      <input
                        type="text"
                        required
                        value={profileForm.displayName}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, displayName: e.target.value }))}
                        className="h-9 w-full rounded-lg border border-surface-200 bg-white pl-9 pr-2.5 text-xs font-semibold dark:border-white/10 dark:bg-slate-950 text-surface-900 dark:text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-surface-500 dark:text-slate-400 block mb-1">Registered Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-surface-400 dark:text-slate-500" />
                      <input
                        type="tel"
                        required
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="h-9 w-full rounded-lg border border-surface-200 bg-white pl-9 pr-2.5 text-xs font-semibold dark:border-white/10 dark:bg-slate-950 text-surface-900 dark:text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-surface-500 dark:text-slate-400 block mb-1">Email (Account ID)</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-surface-400 dark:text-slate-500" />
                      <input
                        type="email"
                        disabled
                        value={profileForm.email}
                        className="h-9 w-full rounded-lg border border-surface-200 bg-surface-50 pl-9 pr-2.5 text-xs font-semibold dark:border-white/5 dark:bg-slate-900/40 text-surface-500 dark:text-slate-500 outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-surface-500 dark:text-slate-400 block mb-1">Farm Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-surface-400 dark:text-slate-500" />
                      <input
                        type="text"
                        required
                        value={profileForm.location}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, location: e.target.value }))}
                        className="h-9 w-full rounded-lg border border-surface-200 bg-white pl-9 pr-2.5 text-xs font-semibold dark:border-white/10 dark:bg-slate-950 text-surface-900 dark:text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-surface-200/50 dark:border-white/5">
                  <button
                    type="submit"
                    className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition flex items-center gap-1.5 shadow-lg shadow-emerald-950/15"
                  >
                    <Save className="h-4 w-4" />
                    Save Profile Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Farm Config Panel */}
          {activeTab === 'farm' && (
            <div className="rounded-2xl border border-white/70 bg-white/70 p-6 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055] animate-in fade-in slide-in-from-right-3 duration-250">
              <h3 className="font-heading text-base font-black tracking-tight text-surface-950 dark:text-white flex items-center gap-2 border-b border-surface-200/50 pb-4 dark:border-white/5 mb-5">
                <Building className="h-5 w-5 text-emerald-500" />
                Sheds & Livestock Configuration
              </h3>

              <form onSubmit={handleSaveFarm} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-surface-500 dark:text-slate-400 block mb-1">Company / Farm Entity Name</label>
                    <input
                      type="text"
                      required
                      value={farmForm.farmName}
                      onChange={(e) => setFarmForm(prev => ({ ...prev, farmName: e.target.value }))}
                      className="h-9 w-full rounded-lg border border-surface-200 bg-white px-2.5 text-xs font-semibold dark:border-white/10 dark:bg-slate-950 text-surface-900 dark:text-white outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-surface-500 dark:text-slate-400 block mb-1">Primary Breed Default</label>
                    <select
                      value={farmForm.primaryBreed}
                      onChange={(e) => setFarmForm(prev => ({ ...prev, primaryBreed: e.target.value }))}
                      className="h-9 w-full rounded-lg border border-surface-200 bg-white px-2 text-xs font-semibold dark:border-white/10 dark:bg-slate-950 text-surface-900 dark:text-white outline-none focus:border-emerald-500"
                    >
                      <option value="Cobb 500 Broiler">Cobb 500 Broiler (Meat)</option>
                      <option value="Ross 308 Broiler">Ross 308 Broiler (Meat)</option>
                      <option value="Hy-Line Layer">Hy-Line Layer (Egg)</option>
                      <option value="Lohmann Brown Layer">Lohmann Brown Layer (Egg)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-surface-500 dark:text-slate-400 block mb-1">Total Active Sheds Count</label>
                    <input
                      type="number"
                      required
                      value={farmForm.totalSheds}
                      onChange={(e) => setFarmForm(prev => ({ ...prev, totalSheds: parseInt(e.target.value) || 1 }))}
                      className="h-9 w-full rounded-lg border border-surface-200 bg-white px-2.5 text-xs font-semibold dark:border-white/10 dark:bg-slate-950 text-surface-900 dark:text-white outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-surface-500 dark:text-slate-400 block mb-1">Maximum Farm Flock Capacity (Birds)</label>
                    <input
                      type="number"
                      required
                      value={farmForm.capacity}
                      onChange={(e) => setFarmForm(prev => ({ ...prev, capacity: parseInt(e.target.value) || 1000 }))}
                      className="h-9 w-full rounded-lg border border-surface-200 bg-white px-2.5 text-xs font-semibold dark:border-white/10 dark:bg-slate-950 text-surface-900 dark:text-white outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-surface-500 dark:text-slate-400 block mb-1">Low Feed Alert Threshold (Bags)</label>
                    <input
                      type="number"
                      required
                      value={farmForm.lowFeedThreshold}
                      onChange={(e) => setFarmForm(prev => ({ ...prev, lowFeedThreshold: parseInt(e.target.value) || 5 }))}
                      className="h-9 w-full rounded-lg border border-surface-200 bg-white px-2.5 text-xs font-semibold dark:border-white/10 dark:bg-slate-950 text-surface-900 dark:text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-surface-200/50 dark:border-white/5">
                  <button
                    type="submit"
                    className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition flex items-center gap-1.5 shadow-lg shadow-emerald-950/15"
                  >
                    <Save className="h-4 w-4" />
                    Save Farm Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Siren & Alarms Panel */}
          {activeTab === 'alerts' && (
            <div className="rounded-2xl border border-white/70 bg-white/70 p-6 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055] animate-in fade-in slide-in-from-right-3 duration-250">
              <h3 className="font-heading text-base font-black tracking-tight text-surface-950 dark:text-white flex items-center gap-2 border-b border-surface-200/50 pb-4 dark:border-white/5 mb-5">
                <Bell className="h-5 w-5 text-emerald-500" />
                Safety Siren & Threshold Configurations
              </h3>

              <form onSubmit={handleSaveAlerts} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-surface-500 dark:text-slate-400 block mb-1">Min Temp Warning (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={alertConfig.tempMin}
                      onChange={(e) => setAlertConfig(prev => ({ ...prev, tempMin: parseFloat(e.target.value) || 15 }))}
                      className="h-9 w-full rounded-lg border border-surface-200 bg-white px-2.5 text-xs font-semibold dark:border-white/10 dark:bg-slate-950 text-surface-900 dark:text-white outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-surface-500 dark:text-slate-400 block mb-1">Max Temp Warning (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={alertConfig.tempMax}
                      onChange={(e) => setAlertConfig(prev => ({ ...prev, tempMax: parseFloat(e.target.value) || 35 }))}
                      className="h-9 w-full rounded-lg border border-surface-200 bg-white px-2.5 text-xs font-semibold dark:border-white/10 dark:bg-slate-950 text-surface-900 dark:text-white outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-surface-500 dark:text-slate-400 block mb-1">Max Ammonia Warning (ppm)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={alertConfig.ammoniaAlert}
                      onChange={(e) => setAlertConfig(prev => ({ ...prev, ammoniaAlert: parseFloat(e.target.value) || 20 }))}
                      className="h-9 w-full rounded-lg border border-surface-200 bg-white px-2.5 text-xs font-semibold dark:border-white/10 dark:bg-slate-950 text-surface-900 dark:text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-surface-200/50 dark:border-white/5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-surface-555 dark:text-slate-450 block">Notification channels</span>
                  
                  {/* Push Toggler */}
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-xs font-bold text-surface-650 dark:text-slate-350">
                      Browser In-App Banner Warnings
                    </span>
                    <button
                      type="button"
                      onClick={() => setAlertConfig(prev => ({ ...prev, enablePush: !prev.enablePush }))}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                        alertConfig.enablePush ? "bg-emerald-500" : "bg-surface-200 dark:bg-white/5"
                      )}
                    >
                      <span className={cn("pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out", alertConfig.enablePush ? "translate-x-5" : "translate-x-0")} />
                    </button>
                  </div>

                  {/* SMS Toggler */}
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-xs font-bold text-surface-650 dark:text-slate-350">
                      Emergency SMS Dispatch to Farm Managers
                    </span>
                    <button
                      type="button"
                      onClick={() => setAlertConfig(prev => ({ ...prev, enableSms: !prev.enableSms }))}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                        alertConfig.enableSms ? "bg-emerald-500" : "bg-surface-200 dark:bg-white/5"
                      )}
                    >
                      <span className={cn("pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out", alertConfig.enableSms ? "translate-x-5" : "translate-x-0")} />
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-surface-200/50 dark:border-white/5">
                  <button
                    type="submit"
                    className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition flex items-center gap-1.5 shadow-lg shadow-emerald-950/15"
                  >
                    <Save className="h-4 w-4" />
                    Save Siren Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Database & Cloud Backup */}
          {activeTab === 'security' && (
            <div className="rounded-2xl border border-white/70 bg-white/70 p-6 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055] space-y-6 animate-in fade-in slide-in-from-right-3 duration-250">
              <div>
                <h3 className="font-heading text-base font-black tracking-tight text-surface-950 dark:text-white flex items-center gap-2 border-b border-surface-200/50 pb-4 dark:border-white/5">
                  <Database className="h-5 w-5 text-emerald-500" />
                  Cloud State & Local Registry Backup
                </h3>
                <p className="text-xs text-surface-500 dark:text-slate-400 mt-1">
                  Manage the state machine databases, download configurations, or reset registry states securely.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Backup Module */}
                <div className="p-4.5 rounded-2xl border border-surface-200/60 dark:border-white/5 bg-white/45 dark:bg-white/[0.02] flex flex-col justify-between h-44">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-450 block">Production Backup</span>
                    <h4 className="text-xs font-black text-surface-950 dark:text-white uppercase tracking-wider">Secure SQL Snapshot</h4>
                    <p className="text-[11px] text-surface-555 dark:text-slate-400 leading-normal font-semibold">Generate a download package enclosing flock details, feeding ledger, and automated rule provisions.</p>
                  </div>
                  <button
                    onClick={handleDatabaseBackup}
                    className="w-full h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 shadow"
                  >
                    <Database className="h-4 w-4" />
                    Back Up Registry
                  </button>
                </div>

                {/* Reset Module */}
                <div className="p-4.5 rounded-2xl border border-surface-200/60 dark:border-white/5 bg-white/45 dark:bg-white/[0.02] flex flex-col justify-between h-44">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-wider text-red-550 block">Safety Restrict</span>
                    <h4 className="text-xs font-black text-surface-950 dark:text-white uppercase tracking-wider">Purge Local Storage</h4>
                    <p className="text-[11px] text-surface-555 dark:text-slate-400 leading-normal font-semibold">Delete cached local states and cookies. Does not touch live Firebase production data registries.</p>
                  </div>
                  <button
                    onClick={() => {
                      window.localStorage.clear()
                      showToast('Local settings and theme cache purged.', 'info')
                    }}
                    className="w-full h-9 rounded-xl bg-red-500 hover:bg-red-650 text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 shadow"
                  >
                    <Lock className="h-4 w-4" />
                    Purge Local Cache
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </AppShell>
  )
}
