import React, { useState, useEffect, useMemo } from 'react'
import {
  Thermometer,
  Droplets,
  Wind,
  Cpu,
  AlertTriangle,
  Clock,
  Sparkles,
  ListRestart,
  Sliders,
  Bell,
  LineChart as LineChartIcon
} from 'lucide-react'
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts'
import AppShell from '../components/ui/AppShell.jsx'
import StatCard from '../components/ui/StatCard.jsx'
import { cn } from '../lib/ui'

// Mock 24h historical telemetry data
const GENERATE_HISTORICAL_DATA = () => {
  const data = []
  const baseTime = new Date()
  for (let i = 23; i >= 0; i--) {
    const time = new Date(baseTime.getTime() - i * 3600000)
    // Sigmoid fluctuation based on hour of day
    const hour = time.getHours()
    const tempOffset = Math.sin((hour - 6) * (Math.PI / 12)) * 4
    const humOffset = -Math.sin((hour - 6) * (Math.PI / 12)) * 12

    data.push({
      time: time.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
      Temperature: Number((26.5 + tempOffset + Math.random() * 0.4).toFixed(1)),
      Humidity: Math.round(62 + humOffset + Math.random() * 2),
      Ammonia: Number((8.5 + (hour > 20 ? 3 : 0) + Math.random() * 1.5).toFixed(1)), // ppm
    })
  }
  return data
}

export default function SmartEnvironment() {
  const [historicalData, setHistoricalData] = useState(GENERATE_HISTORICAL_DATA)
  
  // Real-time sensor states that fluctuate slightly
  const [realtimeSensors, setRealtimeSensors] = useState({
    temp: 27.2,
    humidity: 64,
    co2: 450,
    ammonia: 9.2,
    fansStatus: 'AUTO - OFF',
    heatersStatus: 'AUTO - OFF',
  })

  // User configurable alarm thresholds
  const [thresholds, setThresholds] = useState({
    tempMin: 18.0,
    tempMax: 32.0,
    humMin: 40,
    humMax: 80,
    ammoniaMax: 20.0,
  })

  // Simulate real-time updates every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setRealtimeSensors(prev => {
        const nextTemp = Number((prev.temp + (Math.random() - 0.5) * 0.2).toFixed(1))
        const nextHumidity = Math.min(100, Math.max(20, prev.humidity + Math.round((Math.random() - 0.5) * 2)))
        const nextCo2 = Math.max(350, prev.co2 + Math.round((Math.random() - 0.5) * 15))
        const nextAmmonia = Number(Math.max(1, prev.ammonia + (Math.random() - 0.5) * 0.4).toFixed(1))

        // Basic automated trigger simulation
        let fansStatus = 'AUTO - OFF'
        let heatersStatus = 'AUTO - OFF'
        
        if (nextTemp > thresholds.tempMax || nextAmmonia > 15) {
          fansStatus = 'ACTIVE - COOLING'
        }
        if (nextTemp < thresholds.tempMin) {
          heatersStatus = 'ACTIVE - HEATING'
        }

        return {
          temp: nextTemp,
          humidity: nextHumidity,
          co2: nextCo2,
          ammonia: nextAmmonia,
          fansStatus,
          heatersStatus
        }
      })
    }, 4500)

    return () => clearInterval(timer)
  }, [thresholds])

  // Environmental Alerts generated based on thresholds
  const activeAlerts = useMemo(() => {
    const list = []
    if (realtimeSensors.temp > thresholds.tempMax) {
      list.push({
        id: 'env-1',
        title: 'Thermal High Alert',
        detail: `Coop temperature at ${realtimeSensors.temp}°C exceeds max limit of ${thresholds.tempMax}°C. Automatic ventilation override enabled.`,
        severity: 'critical'
      })
    }
    if (realtimeSensors.temp < thresholds.tempMin) {
      list.push({
        id: 'env-2',
        title: 'Thermal Low Alert',
        detail: `Coop temperature at ${realtimeSensors.temp}°C is below limit of ${thresholds.tempMin}°C. Activators testing heating element.`,
        severity: 'warning'
      })
    }
    if (realtimeSensors.ammonia > thresholds.ammoniaMax) {
      list.push({
        id: 'env-3',
        title: 'High Ammonia Concentration',
        detail: `Ammonia sensors recording ${realtimeSensors.ammonia} ppm. Exhaust fans running on max throughput.`,
        severity: 'critical'
      })
    }
    return list
  }, [realtimeSensors, thresholds])

  // Reset/Regenerate charts
  const handleRefreshHistory = () => {
    setHistoricalData(GENERATE_HISTORICAL_DATA())
  }

  return (
    <AppShell title="Smart Environment Monitor" subtitle="Real-time climate tracking, sensor health auditing, and IoT controllers">
      
      {/* Live Sensors Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Temperature Card */}
        <div className="rounded-2xl border border-white/70 bg-white/75 p-5 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-surface-500 dark:text-slate-400">Coop Temperature</span>
            <p className="font-heading text-3xl font-black text-surface-950 dark:text-white">
              {realtimeSensors.temp} <span className="text-lg font-bold">°C</span>
            </p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              Sensor Active
            </p>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-orange-500/10 text-orange-500 dark:bg-orange-500/20">
            <Thermometer className="h-6 w-6" />
          </div>
        </div>

        {/* Humidity Card */}
        <div className="rounded-2xl border border-white/70 bg-white/75 p-5 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-surface-500 dark:text-slate-400">Litter Humidity</span>
            <p className="font-heading text-3xl font-black text-surface-950 dark:text-white">
              {realtimeSensors.humidity} <span className="text-lg font-bold">%</span>
            </p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              RH Telemetry Good
            </p>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-sky-500/10 text-sky-500 dark:bg-sky-500/20">
            <Droplets className="h-6 w-6" />
          </div>
        </div>

        {/* Air Quality (CO2) */}
        <div className="rounded-2xl border border-white/70 bg-white/75 p-5 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-surface-500 dark:text-slate-400">Carbon Dioxide (CO2)</span>
            <p className="font-heading text-3xl font-black text-surface-950 dark:text-white">
              {realtimeSensors.co2} <span className="text-lg font-bold">ppm</span>
            </p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              Air Quality Index (Safe)
            </p>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20">
            <Wind className="h-6 w-6" />
          </div>
        </div>

        {/* Ammonia Levels */}
        <div className="rounded-2xl border border-white/70 bg-white/75 p-5 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-surface-500 dark:text-slate-400">Ammonia Gas (NH3)</span>
            <p className="font-heading text-3xl font-black text-surface-950 dark:text-white">
              {realtimeSensors.ammonia} <span className="text-lg font-bold">ppm</span>
            </p>
            <p className={cn(
              "text-[10px] font-bold flex items-center gap-1",
              realtimeSensors.ammonia > thresholds.ammoniaMax ? "text-red-500" : "text-emerald-650 dark:text-emerald-400"
            )}>
              <span className={cn("h-1.5 w-1.5 rounded-full animate-ping", realtimeSensors.ammonia > thresholds.ammoniaMax ? "bg-red-500" : "bg-emerald-500")} />
              {realtimeSensors.ammonia > thresholds.ammoniaMax ? 'Critical Threshold Exceeded' : 'Normal Gas Density'}
            </p>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-purple-500/10 text-purple-500 dark:bg-purple-500/20">
            <Cpu className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Climate Analytics History Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-white/70 bg-white/70 p-6 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055] space-y-4">
          <div className="flex items-center justify-between border-b border-surface-200/50 pb-4 dark:border-white/5">
            <div>
              <h3 className="font-heading text-base font-black tracking-tight text-surface-950 dark:text-white flex items-center gap-2">
                <LineChartIcon className="h-5 w-5 text-emerald-500" />
                Climate Analytics & Trends
              </h3>
              <p className="text-xs text-surface-500 dark:text-slate-400">
                24-hour historical log from microclimate telemetry sensors
              </p>
            </div>
            <button
              onClick={handleRefreshHistory}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-surface-200 bg-white px-3 text-xs font-semibold text-surface-700 hover:bg-surface-50 transition dark:border-white/15 dark:bg-slate-900 dark:text-white"
            >
              <ListRestart className="h-4 w-4" />
              Refresh Data
            </button>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="chartHum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={9} tickLine={false} />
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
                <Area type="monotone" name="Temperature (°C)" dataKey="Temperature" stroke="#f97316" fillOpacity={1} fill="url(#chartTemp)" strokeWidth={2.5} />
                <Area type="monotone" name="Humidity (%)" dataKey="Humidity" stroke="#0284c7" fillOpacity={1} fill="url(#chartHum)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Controller Overrides & Alerts */}
        <div className="space-y-6">
          {/* Active Alerts */}
          <div className="rounded-2xl border border-white/70 bg-white/70 p-6 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055]">
            <h3 className="font-heading text-base font-black tracking-tight text-surface-950 dark:text-white flex items-center gap-2">
              <Bell className="h-5 w-5 text-emerald-500" />
              Climate Alerts ({activeAlerts.length})
            </h3>
            <p className="text-xs text-surface-500 dark:text-slate-400 mt-0.5 mb-4">
              Real-time violations of environmental thresholds
            </p>

            <div className="space-y-3">
              {activeAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={cn(
                    "p-3.5 rounded-xl border flex gap-3 text-xs leading-normal",
                    alert.severity === 'critical' 
                      ? "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300"
                      : "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300"
                  )}
                >
                  <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-extrabold">{alert.title}</p>
                    <p className="mt-1 text-[11px] opacity-90">{alert.detail}</p>
                  </div>
                </div>
              ))}

              {activeAlerts.length === 0 && (
                <div className="text-center py-8 text-surface-500 dark:text-slate-400 border border-dashed border-surface-200 dark:border-white/5 rounded-xl">
                  <Sparkles className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <p className="text-xs font-semibold">Climate state fully compliant</p>
                  <p className="text-[10px] mt-1 opacity-70">No warnings or alarm violations active.</p>
                </div>
              )}
            </div>
          </div>

          {/* Alarm Config Controls */}
          <div className="rounded-2xl border border-white/70 bg-white/70 p-6 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055] space-y-4">
            <h3 className="font-heading text-base font-black tracking-tight text-surface-950 dark:text-white flex items-center gap-2">
              <Sliders className="h-5 w-5 text-emerald-500" />
              Threshold Ranges
            </h3>
            <p className="text-xs text-surface-500 dark:text-slate-400 mt-0.5">
              Set triggering thresholds for smart heater and ventilation fans
            </p>

            <div className="space-y-4 mt-4">
              {/* Temperature Thresholds */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-surface-400 dark:text-slate-500 block">Temperature Safe Range</span>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-[10px] text-surface-500 mb-1 block">Min (°C)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={thresholds.tempMin}
                      onChange={(e) => setThresholds(prev => ({ ...prev, tempMin: parseFloat(e.target.value) || 10 }))}
                      className="h-9 w-full rounded-lg border border-surface-200 bg-white px-2.5 text-xs font-semibold dark:border-white/10 dark:bg-slate-950 text-surface-900 dark:text-white"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-surface-500 mb-1 block">Max (°C)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={thresholds.tempMax}
                      onChange={(e) => setThresholds(prev => ({ ...prev, tempMax: parseFloat(e.target.value) || 30 }))}
                      className="h-9 w-full rounded-lg border border-surface-200 bg-white px-2.5 text-xs font-semibold dark:border-white/10 dark:bg-slate-950 text-surface-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Ammonia Threshold */}
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-surface-400 dark:text-slate-500 block">Max Ammonia Density</span>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="5"
                    max="40"
                    value={thresholds.ammoniaMax}
                    onChange={(e) => setThresholds(prev => ({ ...prev, ammoniaMax: parseInt(e.target.value) || 20 }))}
                    className="flex-1 h-1.5 bg-surface-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <span className="text-xs font-black w-12 text-right">{thresholds.ammoniaMax} ppm</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
