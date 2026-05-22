import React, { useState, useEffect, useMemo } from 'react'
import {
  Cpu,
  Power,
  Sliders,
  Plus,
  Trash2,
  Play,
  Pause,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Fan,
  Flame,
  Droplets,
  FolderLock,
  PlusCircle,
  HelpCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'
import AppShell from '../components/ui/AppShell.jsx'
import { cn } from '../lib/ui'

// Initial preloaded automation rules
const INITIAL_RULES = [
  {
    id: 'rule-1',
    name: 'Auto Ventilation Override',
    trigger: 'Ammonia',
    condition: '>',
    value: 15,
    actionDevice: 'Exhaust Fan',
    actionValue: 'ON',
    active: true,
  },
  {
    id: 'rule-2',
    name: 'Emergency Heat Shield',
    trigger: 'Temperature',
    condition: '<',
    value: 19.5,
    actionDevice: 'Coop Heater',
    actionValue: 'ON',
    active: true,
  },
  {
    id: 'rule-3',
    name: 'Critical Cool Down',
    trigger: 'Temperature',
    condition: '>',
    value: 31.0,
    actionDevice: 'Exhaust Fan',
    actionValue: 'ON',
    active: true,
  },
  {
    id: 'rule-4',
    name: 'Nightly Water Shutoff',
    trigger: 'Humidity',
    condition: '>',
    value: 85,
    actionDevice: 'Solenoid Valve',
    actionValue: 'OFF',
    active: false,
  }
]

export default function SmartAutomation() {
  const [isAutoMode, setIsAutoMode] = useState(true)
  const [rules, setRules] = useState(INITIAL_RULES)
  
  // Real-time telemetry simulation (linked to automation triggers)
  const [telemetry, setTelemetry] = useState({
    temp: 26.8,
    humidity: 62,
    ammonia: 8.5,
  })

  // Device Relay States
  const [devices, setDevices] = useState({
    fan: false,
    heater: false,
    valve: true,
    feeder: false,
  })

  // System Logs
  const [logs, setLogs] = useState([
    { timestamp: new Date(Date.now() - 600000).toLocaleTimeString(), type: 'info', message: 'Smart Automation System initialized.' },
    { timestamp: new Date(Date.now() - 300000).toLocaleTimeString(), type: 'success', message: 'Rule "Auto Ventilation Override" synced to local controllers.' },
    { timestamp: new Date(Date.now() - 150000).toLocaleTimeString(), type: 'info', message: 'Solenoid Valve (Valve-03) status: OPEN. Flow normal at 0.45 L/min.' }
  ])

  // Form State for new rule
  const [newRuleName, setNewRuleName] = useState('')
  const [newRuleTrigger, setNewRuleTrigger] = useState('Temperature')
  const [newRuleCondition, setNewRuleCondition] = useState('>')
  const [newRuleValue, setNewRuleValue] = useState('')
  const [newRuleDevice, setNewRuleDevice] = useState('Exhaust Fan')
  const [newRuleAction, setNewRuleAction] = useState('ON')

  // Tick simulation every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Fluctuate telemetry values
      setTelemetry(prev => {
        const tempDelta = (Math.random() - 0.5) * 1.5
        const humDelta = Math.round((Math.random() - 0.5) * 4)
        const ammoniaDelta = (Math.random() - 0.5) * 1.2

        const nextTemp = Number((prev.temp + tempDelta).toFixed(1))
        const nextHum = Math.min(100, Math.max(10, prev.humidity + humDelta))
        const nextAmmonia = Number(Math.max(1.0, prev.ammonia + ammoniaDelta).toFixed(1))

        return {
          temp: nextTemp,
          humidity: nextHum,
          ammonia: nextAmmonia,
        }
      })
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  // Automation controller engine (runs whenever telemetry or active rules change)
  useEffect(() => {
    if (!isAutoMode) return

    setDevices(prev => {
      let nextFan = false
      let nextHeater = false
      let nextValve = prev.valve
      let nextFeeder = prev.feeder

      const triggeredLogs = []

      // Evaluate active rules
      rules.filter(r => r.active).forEach(rule => {
        let valueToCheck = 0
        if (rule.trigger === 'Temperature') valueToCheck = telemetry.temp
        if (rule.trigger === 'Humidity') valueToCheck = telemetry.humidity
        if (rule.trigger === 'Ammonia') valueToCheck = telemetry.ammonia

        let isTriggered = false
        if (rule.condition === '>') isTriggered = valueToCheck > rule.value
        if (rule.condition === '<') isTriggered = valueToCheck < rule.value
        if (rule.condition === '=') isTriggered = Math.abs(valueToCheck - rule.value) < 0.1

        if (isTriggered) {
          const deviceOn = rule.actionValue === 'ON'
          if (rule.actionDevice === 'Exhaust Fan' && nextFan !== deviceOn) {
            nextFan = deviceOn
            triggeredLogs.push(`Rule "${rule.name}" triggered: ${rule.trigger} (${valueToCheck}) ${rule.condition} ${rule.value}. Turned Exhaust Fan ${rule.actionValue}.`)
          }
          if (rule.actionDevice === 'Coop Heater' && nextHeater !== deviceOn) {
            nextHeater = deviceOn
            triggeredLogs.push(`Rule "${rule.name}" triggered: ${rule.trigger} (${valueToCheck}) ${rule.condition} ${rule.value}. Turned Coop Heater ${rule.actionValue}.`)
          }
          if (rule.actionDevice === 'Solenoid Valve' && nextValve !== deviceOn) {
            nextValve = deviceOn
            triggeredLogs.push(`Rule "${rule.name}" triggered: ${rule.trigger} (${valueToCheck}) ${rule.condition} ${rule.value}. Turned Solenoid Valve ${rule.actionValue}.`)
          }
        }
      })

      if (triggeredLogs.length > 0) {
        setLogs(prevLogs => [
          ...triggeredLogs.map(msg => ({
            timestamp: new Date().toLocaleTimeString(),
            type: 'action',
            message: msg
          })),
          ...prevLogs
        ].slice(0, 40)) // limit history
      }

      return {
        fan: nextFan,
        heater: nextHeater,
        valve: nextValve,
        feeder: nextFeeder,
      }
    })
  }, [telemetry, rules, isAutoMode])

  // Handle Manual Device Toggles (only possible in Manual override)
  const toggleDevice = (dev) => {
    if (isAutoMode) return
    setDevices(prev => {
      const nextVal = !prev[dev]
      setLogs(prevLogs => [
        {
          timestamp: new Date().toLocaleTimeString(),
          type: 'info',
          message: `Manual Override: Toggled ${dev.toUpperCase()} state to ${nextVal ? 'ON' : 'OFF'}`
        },
        ...prevLogs
      ].slice(0, 40))
      return { ...prev, [dev]: nextVal }
    })
  }

  // Handle feed dispensing trigger (augur)
  const triggerDispense = () => {
    setDevices(prev => ({ ...prev, feeder: true }))
    setLogs(prevLogs => [
      { timestamp: new Date().toLocaleTimeString(), type: 'success', message: 'Manual dispatch: Dispensed 4.5kg of feed via Auger Feeder.' },
      ...prevLogs
    ])
    // Auto turn off after 2 seconds
    setTimeout(() => {
      setDevices(prev => ({ ...prev, feeder: false }))
    }, 2000)
  }

  // Create new rule
  const handleCreateRule = (e) => {
    e.preventDefault()
    if (!newRuleName.trim() || !newRuleValue) return

    const rule = {
      id: `rule-${Date.now()}`,
      name: newRuleName,
      trigger: newRuleTrigger,
      condition: newRuleCondition,
      value: parseFloat(newRuleValue),
      actionDevice: newRuleDevice,
      actionValue: newRuleAction,
      active: true,
    }

    setRules(prev => [...prev, rule])
    setLogs(prevLogs => [
      { timestamp: new Date().toLocaleTimeString(), type: 'success', message: `Added new automation rule: "${newRuleName}".` },
      ...prevLogs
    ])
    // Reset Form
    setNewRuleName('')
    setNewRuleValue('')
  }

  // Toggle active rule
  const toggleRule = (id) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r))
  }

  // Delete rule
  const deleteRule = (id) => {
    const target = rules.find(r => r.id === id)
    setRules(prev => prev.filter(r => r.id !== id))
    if (target) {
      setLogs(prevLogs => [
        { timestamp: new Date().toLocaleTimeString(), type: 'info', message: `Removed automation rule: "${target.name}".` },
        ...prevLogs
      ])
    }
  }

  return (
    <AppShell title="Smart Automation Control" subtitle="Configure automated sensor triggers, manual hardware overrides, and live actuator logging">
      
      {/* Simulation Banner & Global Controls */}
      <div className="rounded-2xl border border-white/70 bg-white/75 p-5 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20">
            <Cpu className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-black tracking-tight text-surface-950 dark:text-white flex items-center gap-2">
              PLC Edge Controller System
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            </h2>
            <p className="text-xs text-surface-500 dark:text-slate-400">
              Live Connection Status: <span className="font-bold text-emerald-600 dark:text-emerald-400">Syncing with Coop-PLC-04</span>
            </p>
          </div>
        </div>

        {/* Global Auto/Manual Switch */}
        <div className="flex items-center gap-4 bg-white/50 dark:bg-white/5 p-2 rounded-xl border border-surface-200/50 dark:border-white/5">
          <span className="text-xs font-black uppercase tracking-wider text-surface-500 dark:text-slate-400">
            System Mode:
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsAutoMode(true)
                setLogs(prev => [{ timestamp: new Date().toLocaleTimeString(), type: 'info', message: 'System Mode set to FULL AUTOMATION.' }, ...prev])
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-extrabold transition",
                isAutoMode
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/10"
                  : "bg-transparent text-surface-600 dark:text-slate-400 hover:bg-surface-100 dark:hover:bg-white/5"
              )}
            >
              Auto Pilot
            </button>
            <button
              onClick={() => {
                setIsAutoMode(false)
                setLogs(prev => [{ timestamp: new Date().toLocaleTimeString(), type: 'warning', message: 'System Mode set to MANUAL OVERRIDE. Safety triggers suspended.' }, ...prev])
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-extrabold transition",
                !isAutoMode
                  ? "bg-amber-500 text-white shadow-md shadow-amber-500/10"
                  : "bg-transparent text-surface-600 dark:text-slate-400 hover:bg-surface-100 dark:hover:bg-white/5"
              )}
            >
              Manual Override
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Columns - Device Relays & Trigger Rule List */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Live Actuators / Relays Grid */}
          <div className="rounded-2xl border border-white/70 bg-white/70 p-6 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055]">
            <div className="flex items-center justify-between border-b border-surface-200/50 pb-4 dark:border-white/5 mb-5">
              <div>
                <h3 className="font-heading text-base font-black tracking-tight text-surface-950 dark:text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-emerald-500" />
                  Actuators & Relay Controls
                </h3>
                <p className="text-xs text-surface-500 dark:text-slate-400">
                  Toggle manual overrides or monitor real-time PLC states
                </p>
              </div>
              {!isAutoMode && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 animate-pulse border border-amber-500/20">
                  Manual Control Active
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              
              {/* Exhaust Fan */}
              <div className={cn(
                "p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between h-40",
                devices.fan 
                  ? "bg-emerald-500/5 border-emerald-500/25 shadow-md shadow-emerald-500/5" 
                  : "bg-white/50 border-surface-200/50 dark:bg-white/5 dark:border-white/5"
              )}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <div className={cn("p-2 rounded-lg transition", devices.fan ? "bg-emerald-500/10 text-emerald-500" : "bg-surface-100 text-surface-555 dark:bg-white/5 dark:text-slate-400")}>
                      <Fan className={cn("h-5 w-5", devices.fan && "animate-spin")} style={{ animationDuration: '1.5s' }} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-surface-900 dark:text-white uppercase tracking-wider">Exhaust Fan</h4>
                      <p className="text-[10px] text-surface-500 dark:text-slate-400">Model: Fan-01 (Coop Airflow)</p>
                    </div>
                  </div>
                  <div className={cn(
                    "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider",
                    devices.fan ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-surface-200/60 text-surface-600 dark:bg-white/5 dark:text-slate-400"
                  )}>
                    {devices.fan ? 'ON' : 'OFF'}
                  </div>
                </div>

                <div className="flex justify-between items-end mt-4">
                  <div className="text-[10px] text-surface-500 dark:text-slate-400">
                    <p>Relay Pin: <span className="font-bold">D04</span></p>
                    <p>Current Draw: <span className="font-bold text-surface-700 dark:text-white">{devices.fan ? '240W' : '0W'}</span></p>
                  </div>
                  <button
                    disabled={isAutoMode}
                    onClick={() => toggleDevice('fan')}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5",
                      isAutoMode 
                        ? "opacity-50 cursor-not-allowed bg-surface-200 text-surface-400 dark:bg-white/5 dark:text-slate-500"
                        : devices.fan 
                          ? "bg-red-500 text-white hover:bg-red-650"
                          : "bg-emerald-500 text-white hover:bg-emerald-650"
                    )}
                  >
                    <Power className="h-3.5 w-3.5" />
                    {devices.fan ? 'Shut Down' : 'Boot Up'}
                  </button>
                </div>
              </div>

              {/* Coop Heater */}
              <div className={cn(
                "p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between h-40",
                devices.heater 
                  ? "bg-orange-500/5 border-orange-500/25 shadow-md shadow-orange-500/5" 
                  : "bg-white/50 border-surface-200/50 dark:bg-white/5 dark:border-white/5"
              )}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <div className={cn("p-2 rounded-lg transition", devices.heater ? "bg-orange-500/10 text-orange-500 animate-pulse" : "bg-surface-100 text-surface-555 dark:bg-white/5 dark:text-slate-400")}>
                      <Flame className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-surface-900 dark:text-white uppercase tracking-wider">Coop Heater</h4>
                      <p className="text-[10px] text-surface-500 dark:text-slate-400">Model: Heat-02 (Aux Heater)</p>
                    </div>
                  </div>
                  <div className={cn(
                    "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider",
                    devices.heater ? "bg-orange-500/20 text-orange-600 dark:text-orange-400" : "bg-surface-200/60 text-surface-600 dark:bg-white/5 dark:text-slate-400"
                  )}>
                    {devices.heater ? 'ACTIVE' : 'IDLE'}
                  </div>
                </div>

                <div className="flex justify-between items-end mt-4">
                  <div className="text-[10px] text-surface-500 dark:text-slate-400">
                    <p>Relay Pin: <span className="font-bold">D05</span></p>
                    <p>Power Level: <span className="font-bold text-surface-700 dark:text-white">{devices.heater ? '1800W' : '0W'}</span></p>
                  </div>
                  <button
                    disabled={isAutoMode}
                    onClick={() => toggleDevice('heater')}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5",
                      isAutoMode 
                        ? "opacity-50 cursor-not-allowed bg-surface-200 text-surface-400 dark:bg-white/5 dark:text-slate-500"
                        : devices.heater 
                          ? "bg-red-500 text-white hover:bg-red-650"
                          : "bg-emerald-500 text-white hover:bg-emerald-650"
                    )}
                  >
                    <Power className="h-3.5 w-3.5" />
                    {devices.heater ? 'Shut Down' : 'Boot Up'}
                  </button>
                </div>
              </div>

              {/* Solenoid Valve */}
              <div className={cn(
                "p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between h-40",
                devices.valve 
                  ? "bg-sky-500/5 border-sky-500/25 shadow-md shadow-sky-500/5" 
                  : "bg-white/50 border-surface-200/50 dark:bg-white/5 dark:border-white/5"
              )}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <div className={cn("p-2 rounded-lg transition", devices.valve ? "bg-sky-500/10 text-sky-500" : "bg-surface-100 text-surface-555 dark:bg-white/5 dark:text-slate-400")}>
                      <Droplets className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-surface-900 dark:text-white uppercase tracking-wider">Water Solenoid</h4>
                      <p className="text-[10px] text-surface-500 dark:text-slate-400">Model: Valve-03 (Lines Main)</p>
                    </div>
                  </div>
                  <div className={cn(
                    "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider",
                    devices.valve ? "bg-sky-500/20 text-sky-600 dark:text-sky-400" : "bg-red-500/20 text-red-600 dark:text-red-400"
                  )}>
                    {devices.valve ? 'OPEN' : 'CLOSED'}
                  </div>
                </div>

                <div className="flex justify-between items-end mt-4">
                  <div className="text-[10px] text-surface-500 dark:text-slate-400">
                    <p>Relay Pin: <span className="font-bold">D06</span></p>
                    <p>Current Flow: <span className="font-bold text-surface-700 dark:text-white">{devices.valve ? '0.45 L/min' : '0.00 L/min'}</span></p>
                  </div>
                  <button
                    disabled={isAutoMode}
                    onClick={() => toggleDevice('valve')}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5",
                      isAutoMode 
                        ? "opacity-50 cursor-not-allowed bg-surface-200 text-surface-400 dark:bg-white/5 dark:text-slate-500"
                        : devices.valve 
                          ? "bg-red-500 text-white hover:bg-red-650"
                          : "bg-emerald-500 text-white hover:bg-emerald-650"
                    )}
                  >
                    <Power className="h-3.5 w-3.5" />
                    {devices.valve ? 'Close Valve' : 'Open Valve'}
                  </button>
                </div>
              </div>

              {/* Feed dispenser */}
              <div className={cn(
                "p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between h-40",
                devices.feeder 
                  ? "bg-purple-500/5 border-purple-500/25 shadow-md shadow-purple-500/5" 
                  : "bg-white/50 border-surface-200/50 dark:bg-white/5 dark:border-white/5"
              )}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <div className={cn("p-2 rounded-lg transition", devices.feeder ? "bg-purple-500/10 text-purple-500 animate-bounce" : "bg-surface-100 text-surface-555 dark:bg-white/5 dark:text-slate-400")}>
                      <Cpu className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-surface-900 dark:text-white uppercase tracking-wider">Auger Feeder</h4>
                      <p className="text-[10px] text-surface-500 dark:text-slate-400">Model: Feed-04 (Coop Feeders)</p>
                    </div>
                  </div>
                  <div className={cn(
                    "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider",
                    devices.feeder ? "bg-purple-500/20 text-purple-650 dark:text-purple-400" : "bg-surface-200/60 text-surface-600 dark:bg-white/5 dark:text-slate-400"
                  )}>
                    {devices.feeder ? 'FEEDING' : 'READY'}
                  </div>
                </div>

                <div className="flex justify-between items-end mt-4">
                  <div className="text-[10px] text-surface-500 dark:text-slate-400">
                    <p>Relay Pin: <span className="font-bold">D07</span></p>
                    <p>Last Dispense: <span className="font-bold text-surface-700 dark:text-white">10 mins ago</span></p>
                  </div>
                  <button
                    onClick={triggerDispense}
                    disabled={devices.feeder}
                    className="px-3 py-1.5 rounded-lg text-xs font-black bg-purple-650 hover:bg-purple-700 text-white transition flex items-center gap-1.5 shadow-md shadow-purple-950/10"
                  >
                    <Play className="h-3 w-3" />
                    Dispense Feed
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Trigger Rules Listing */}
          <div className="rounded-2xl border border-white/70 bg-white/70 p-6 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055] space-y-4">
            <h3 className="font-heading text-base font-black tracking-tight text-surface-950 dark:text-white flex items-center gap-2">
              <Sliders className="h-5 w-5 text-emerald-500" />
              Active Environmental Automation Rules
            </h3>
            <p className="text-xs text-surface-500 dark:text-slate-400 mt-0.5">
              These conditions run on the local edge gateway controller and execute automated actions.
            </p>

            <div className="space-y-3 mt-4">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className={cn(
                    "flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border transition-colors",
                    rule.active 
                      ? "bg-white/80 dark:bg-white/[0.04] border-surface-200 dark:border-white/10" 
                      : "bg-surface-50/50 dark:bg-slate-900/10 border-dashed border-surface-200/60 dark:border-white/5 opacity-60"
                  )}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-surface-950 dark:text-white">{rule.name}</h4>
                      {!rule.active && (
                        <span className="text-[8px] font-black uppercase bg-surface-200 dark:bg-white/5 text-surface-500 px-1.5 py-0.5 rounded">Disabled</span>
                      )}
                    </div>
                    <p className="text-[11px] text-surface-555 dark:text-slate-400 font-semibold">
                      IF <span className="text-emerald-600 dark:text-emerald-400 font-bold">{rule.trigger}</span> {rule.condition} <span className="font-bold text-surface-800 dark:text-white">{rule.value} {rule.trigger === 'Temperature' ? '°C' : rule.trigger === 'Ammonia' ? 'ppm' : '%'}</span>, 
                      THEN turn <span className="text-purple-600 dark:text-purple-400 font-bold">{rule.actionDevice}</span> <span className="font-bold uppercase text-surface-800 dark:text-white">{rule.actionValue}</span>.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Toggle Rule */}
                    <button
                      onClick={() => toggleRule(rule.id)}
                      className="text-surface-450 hover:text-emerald-500 dark:text-slate-400 dark:hover:text-emerald-400 transition"
                      title={rule.active ? "Deactivate Rule" : "Activate Rule"}
                    >
                      {rule.active ? (
                        <ToggleRight className="h-6 w-6 text-emerald-500" />
                      ) : (
                        <ToggleLeft className="h-6 w-6" />
                      )}
                    </button>
                    
                    {/* Delete Rule */}
                    <button
                      onClick={() => deleteRule(rule.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-surface-400 hover:text-red-500 dark:text-slate-500 transition"
                      title="Delete Rule"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {rules.length === 0 && (
                <div className="text-center py-10 text-surface-500 dark:text-slate-400 border border-dashed border-surface-200 dark:border-white/5 rounded-xl">
                  <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2 opacity-80" />
                  <p className="text-xs font-semibold">No automation rules configured</p>
                  <p className="text-[10px] mt-1 opacity-70">Add a rule on the right panel to initialize automated controller logic.</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column - Rule Creator & Real-time System Log */}
        <div className="space-y-6">
          
          {/* Rule Creator */}
          <div className="rounded-2xl border border-white/70 bg-white/70 p-6 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055]">
            <h3 className="font-heading text-base font-black tracking-tight text-surface-950 dark:text-white flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-emerald-500" />
              Build Automation Rule
            </h3>
            <p className="text-xs text-surface-500 dark:text-slate-400 mt-0.5 mb-4">
              Provision instant triggers matching environment telemetry
            </p>

            <form onSubmit={handleCreateRule} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-surface-400 dark:text-slate-500 block mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Max Cool Fan Override"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  className="h-9 w-full rounded-lg border border-surface-200 bg-white px-2.5 text-xs font-semibold dark:border-white/10 dark:bg-slate-950 text-surface-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-surface-400 dark:text-slate-500 block mb-1">Trigger Sensor</label>
                  <select
                    value={newRuleTrigger}
                    onChange={(e) => setNewRuleTrigger(e.target.value)}
                    className="h-9 w-full rounded-lg border border-surface-200 bg-white px-2 text-xs font-semibold dark:border-white/10 dark:bg-slate-950 text-surface-900 dark:text-white outline-none focus:border-emerald-500"
                  >
                    <option value="Temperature">Temperature (°C)</option>
                    <option value="Humidity">Humidity (%)</option>
                    <option value="Ammonia">Ammonia (ppm)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-surface-400 dark:text-slate-500 block mb-1">Cond.</label>
                  <select
                    value={newRuleCondition}
                    onChange={(e) => setNewRuleCondition(e.target.value)}
                    className="h-9 w-full rounded-lg border border-surface-200 bg-white px-2 text-xs font-semibold dark:border-white/10 dark:bg-slate-950 text-surface-900 dark:text-white outline-none focus:border-emerald-500"
                  >
                    <option value=">">&gt;</option>
                    <option value="<">&lt;</option>
                    <option value="=">=</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-surface-400 dark:text-slate-500 block mb-1">Target Value</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="e.g. 30.5"
                  value={newRuleValue}
                  onChange={(e) => setNewRuleValue(e.target.value)}
                  className="h-9 w-full rounded-lg border border-surface-200 bg-white px-2.5 text-xs font-semibold dark:border-white/10 dark:bg-slate-950 text-surface-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-surface-400 dark:text-slate-500 block mb-1">Action Device</label>
                  <select
                    value={newRuleDevice}
                    onChange={(e) => setNewRuleDevice(e.target.value)}
                    className="h-9 w-full rounded-lg border border-surface-200 bg-white px-2 text-xs font-semibold dark:border-white/10 dark:bg-slate-950 text-surface-900 dark:text-white outline-none focus:border-emerald-500"
                  >
                    <option value="Exhaust Fan">Exhaust Fan</option>
                    <option value="Coop Heater">Coop Heater</option>
                    <option value="Solenoid Valve">Solenoid Valve</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-surface-400 dark:text-slate-500 block mb-1">Set State</label>
                  <select
                    value={newRuleAction}
                    onChange={(e) => setNewRuleAction(e.target.value)}
                    className="h-9 w-full rounded-lg border border-surface-200 bg-white px-2 text-xs font-semibold dark:border-white/10 dark:bg-slate-950 text-surface-900 dark:text-white outline-none focus:border-emerald-500"
                  >
                    <option value="ON">ON / OPEN</option>
                    <option value="OFF">OFF / CLOSE</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/10 mt-2"
              >
                <Plus className="h-4 w-4" />
                Upload Rule to PLC
              </button>
            </form>
          </div>

          {/* Real-time System Log */}
          <div className="rounded-2xl border border-white/70 bg-white/70 p-6 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055] flex flex-col h-[380px]">
            <div className="border-b border-surface-200/50 pb-3 dark:border-white/5 mb-3 flex items-center justify-between">
              <div>
                <h3 className="font-heading text-sm font-black tracking-tight text-surface-950 dark:text-white">
                  Controller Activity Logs
                </h3>
                <p className="text-[10px] text-surface-500 dark:text-slate-400">
                  Live diagnostics streams from Coop-PLC-04 gateway
                </p>
              </div>
              <button
                onClick={() => setLogs([])}
                className="p-1 rounded hover:bg-surface-100 dark:hover:bg-white/5 text-[9px] font-black text-surface-500 dark:text-slate-400"
              >
                Clear
              </button>
            </div>

            {/* Telemetry Indicator Row */}
            <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-white/45 dark:bg-white/[0.03] border border-surface-200/50 dark:border-white/5 rounded-xl text-center text-[10px] mb-3 shrink-0 font-bold">
              <div>
                <span className="text-[8px] text-surface-400 dark:text-slate-500 block uppercase">Temp</span>
                <span className="text-surface-850 dark:text-white">{telemetry.temp}°C</span>
              </div>
              <div>
                <span className="text-[8px] text-surface-400 dark:text-slate-500 block uppercase">Humidity</span>
                <span className="text-surface-850 dark:text-white">{telemetry.humidity}%</span>
              </div>
              <div>
                <span className="text-[8px] text-surface-400 dark:text-slate-500 block uppercase">Ammonia</span>
                <span className="text-surface-850 dark:text-white">{telemetry.ammonia} ppm</span>
              </div>
            </div>

            {/* Scrollable logs */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-[11px] leading-relaxed scrollbar-thin">
              {logs.map((log, index) => (
                <div key={index} className="flex gap-2">
                  <span className="text-surface-400 dark:text-slate-500 font-mono select-none shrink-0 font-medium">[{log.timestamp}]</span>
                  <p className={cn(
                    "font-semibold",
                    log.type === 'success' && "text-emerald-700 dark:text-emerald-450",
                    log.type === 'warning' && "text-amber-700 dark:text-amber-450",
                    log.type === 'action' && "text-purple-700 dark:text-purple-405",
                    log.type === 'info' && "text-surface-700 dark:text-slate-300"
                  )}>
                    {log.message}
                  </p>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 mb-1" />
                  <p className="text-[10px]">No recent log entries. System status is quiet.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  )
}
