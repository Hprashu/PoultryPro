import React from 'react'
import { motion } from 'framer-motion'
import { Activity, Cpu, Leaf, Moon, ShieldCheck, Sun } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext.jsx'
import BrandMark from './BrandMark.jsx'

/* 24 floating particles with deterministic positions */
const particles = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  left: `${(i * 37) % 100}%`,
  top: `${(i * 19) % 100}%`,
  delay: (i % 8) * 0.24,
  duration: 4 + (i % 5) * 0.45,
}))

export default function AuthShell({ eyebrow, title, highlight, description, stats = [], children }) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen lg:overflow-hidden">
      {/* ============================================================
          LEFT HERO  –  60 % width on desktop, stacked on mobile
          ============================================================ */}
      <section
        className="
          relative flex flex-col overflow-hidden
          bg-emerald-950
          w-full lg:w-[60%] shrink-0
          min-h-[340px] sm:min-h-[420px] lg:min-h-0 lg:h-full
        "
      >
        {/* --- layered backgrounds --- */}
        <div className="absolute inset-0 bg-[url('/poultrypro-brand.jpeg')] bg-cover bg-center opacity-[0.14]" />
        <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(2,44,34,0.97)_0%,rgba(5,46,22,0.93)_40%,rgba(15,23,42,0.96)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_75%_20%,rgba(250,204,21,0.13),transparent),radial-gradient(ellipse_50%_60%_at_20%_80%,rgba(16,185,129,0.20),transparent)]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.1)_1px,transparent_1px)] [background-size:48px_48px]" />

        {/* --- particles --- */}
        {particles.map((p) => (
          <motion.span
            key={p.id}
            className="absolute h-1 w-1 rounded-full bg-emerald-300/40"
            style={{ left: p.left, top: p.top }}
            animate={{ y: [-14, 14, -14], opacity: [0.08, 0.55, 0.08] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}

        {/* --- hero content container --- */}
        <div className="relative z-10 flex flex-1 flex-col px-6 py-7 sm:px-10 sm:py-9 lg:px-14 lg:py-10 xl:px-16">
          {/* top bar */}
          <div className="flex items-center justify-between gap-4">
            <BrandMark dark />
            <span className="rounded-full border border-white/[0.12] bg-white/[0.06] px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-emerald-200/90 backdrop-blur-xl select-none">
              AI Farm OS
            </span>
          </div>

          {/* center content (flex-1 + items-center = vertical center) */}
          <div className="flex flex-1 items-center py-8 lg:py-6">
            <div className="w-full max-w-[640px]">
              <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [.22,1,.36,1] }}>
                {/* eyebrow */}
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.05] px-3.5 py-1.5 backdrop-blur-xl">
                  <Leaf className="h-3.5 w-3.5 text-amber-300" />
                  <span className="text-[11px] font-bold tracking-wide text-emerald-100/90">{eyebrow}</span>
                </div>

                {/* heading */}
                <h1 className="font-heading text-[clamp(1.85rem,3.8vw,3.5rem)] font-black leading-[1.08] tracking-tight text-white">
                  {title}{' '}
                  <span className="bg-gradient-to-r from-emerald-300 via-amber-200 to-lime-200 bg-clip-text text-transparent">
                    {highlight}
                  </span>
                </h1>

                {/* description */}
                <p className="mt-4 max-w-[520px] text-[15px] font-medium leading-relaxed text-emerald-100/60">
                  {description}
                </p>
              </motion.div>

              {/* stat cards – hidden on small mobile */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.18, ease: [.22,1,.36,1] }}
                className="mt-8 hidden sm:grid grid-cols-3 gap-3"
              >
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-white/[0.07] bg-white/[0.035] p-4 backdrop-blur-xl transition-colors duration-300 hover:bg-white/[0.06]"
                  >
                    <p className="font-heading text-[clamp(1.25rem,2.5vw,1.75rem)] font-black leading-none text-white">
                      {stat.value}
                    </p>
                    <p className="mt-2 truncate text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-100/45">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </motion.div>

              {/* progress card – hidden below md */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.32, ease: [.22,1,.36,1] }}
                className="mt-4 hidden lg:block rounded-xl border border-white/[0.07] bg-white/[0.035] p-4 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-400/10 text-emerald-300">
                      <Cpu className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-white/90">Live AI Analytics Streaming</p>
                      <p className="truncate text-[10px] font-medium text-emerald-200/40">Sensor grid &amp; Firebase sync</p>
                    </div>
                  </div>
                  <p className="shrink-0 font-heading text-xl font-black text-amber-200/90">94%</p>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-amber-200"
                    initial={{ width: 0 }}
                    animate={{ width: '94%' }}
                    transition={{ duration: 1.1, delay: 0.5, ease: [.22,1,.36,1] }}
                  />
                </div>
                <div className="mt-2.5 flex items-center gap-4 text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-200/30">
                  <span className="inline-flex items-center gap-1"><Activity className="h-2.5 w-2.5" /> Telemetry</span>
                  <span className="inline-flex items-center gap-1"><ShieldCheck className="h-2.5 w-2.5" /> Firebase Guard</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          RIGHT AUTH PANEL  –  40 % width on desktop
          ============================================================ */}
      <main
        className="
          relative flex flex-1 flex-col items-center justify-center
          overflow-y-auto
          w-full lg:w-[40%] lg:h-full
          px-5 py-10 sm:px-8 lg:px-10 xl:px-14
          bg-white dark:bg-slate-950
          bg-[radial-gradient(ellipse_70%_50%_at_80%_10%,rgba(16,185,129,0.06),transparent)]
          dark:bg-[radial-gradient(ellipse_70%_50%_at_80%_10%,rgba(16,185,129,0.10),transparent)]
        "
      >
        {/* floating theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="
            absolute right-4 top-4 z-20
            grid h-10 w-10 place-items-center rounded-xl
            border border-slate-200/80 bg-white/90 text-slate-500 shadow-sm
            backdrop-blur-xl transition-all duration-300
            hover:border-emerald-300 hover:text-emerald-600 hover:shadow-md
            dark:border-white/[0.08] dark:bg-slate-900/80 dark:text-slate-400
            dark:hover:border-white/[0.15] dark:hover:text-white
          "
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </button>

        {/* auth form card */}
        <motion.div
          initial={{ opacity: 0, y: 22, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [.22,1,.36,1] }}
          className="
            w-full max-w-[460px]
            rounded-2xl
            border border-slate-200/70
            bg-white
            p-7 sm:p-9
            shadow-xl shadow-slate-900/[0.04]
            dark:border-white/[0.06]
            dark:bg-slate-900/70
            dark:shadow-black/20
          "
        >
          {/* show brand mark on mobile only (hero is stacked above) */}
          <div className="mb-7 flex justify-center lg:hidden">
            <BrandMark />
          </div>

          {children}
        </motion.div>
      </main>
    </div>
  )
}
