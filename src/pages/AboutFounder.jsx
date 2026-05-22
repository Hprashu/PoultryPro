import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { 
  Code, 
  Briefcase, 
  Mail, 
  Globe, 
  Copy, 
  Check, 
  ChevronRight, 
  Rocket, 
  Award, 
  BookOpen, 
  Heart, 
  Sparkles, 
  Cpu, 
  Database, 
  Eye, 
  Target, 
  TrendingUp, 
  MapPin, 
  Users, 
  ShieldAlert,
  ArrowUpRight,
  Flame,
  Languages,
  Mic,
  Camera,
  Layers,
  Calendar
} from 'lucide-react'
import AppShell from '../components/ui/AppShell.jsx'
import { useToast } from '../contexts/ToastContext.jsx'
import { cn } from '../lib/ui.js'

export default function AboutFounder() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const [copiedText, setCopiedText] = useState('')

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text)
    setCopiedText(type)
    showToast(t('about.copied_msg', `${type} copied to clipboard!`), 'success')
    setTimeout(() => setCopiedText(''), 2000)
  }

  // Animation constants for clean sequencing
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 15 } 
    }
  }

  const skillCategories = [
    {
      title: t('about.skills.core', 'Core Architecture'),
      icon: Cpu,
      color: 'from-emerald-500 to-green-600',
      skills: ['React', 'Vite', 'Tailwind CSS', 'Framer Motion']
    },
    {
      title: t('about.skills.backend', 'Data Registry & Cloud'),
      icon: Database,
      color: 'from-blue-500 to-indigo-600',
      skills: ['Firebase Auth', 'Cloud Firestore', 'Local Sandbox', 'Realtime Sync']
    },
    {
      title: t('about.skills.ai', 'AI & Rural Interfaces'),
      icon: Sparkles,
      color: 'from-purple-500 to-pink-600',
      skills: ['Web Speech TTS/STT', 'Regional Locales', 'AI Image Recognition', 'Interactive Chatbot']
    }
  ]

  const roadmapSteps = [
    {
      phase: 'Phase 1',
      title: t('about.roadmap.phase1_title', 'Multilingual Speech Ecosystem'),
      desc: t('about.roadmap.phase1_desc', 'Deployment of BCP-47 speech recognition and synthesis across 7 Indian regional languages.'),
      status: 'completed',
      date: 'Q2 2026'
    },
    {
      phase: 'Phase 2',
      title: t('about.roadmap.phase2_title', 'AI Disease Scanner & Camera Snapping'),
      desc: t('about.roadmap.phase2_desc', 'Interactive mobile camera disease identification engine using simulated bounding-box coordinates.'),
      status: 'completed',
      date: 'Q2 2026'
    },
    {
      phase: 'Phase 3',
      title: t('about.roadmap.phase3_title', 'IoT Poultry Microclimate Sensors'),
      desc: t('about.roadmap.phase3_desc', 'Realtime physical telemetry hardware integration for temperature, ammonia levels, and automated fans.'),
      status: 'upcoming',
      date: 'Q3 2026'
    },
    {
      phase: 'Phase 4',
      title: t('about.roadmap.phase4_title', 'Farmer Peer-to-Peer Marketplace'),
      desc: t('about.roadmap.phase4_desc', 'Establishing a direct trading network for grain feeds, eggs, and veterinary supplies without middle-agents.'),
      status: 'upcoming',
      date: 'Q4 2026'
    },
    {
      phase: 'Phase 5',
      title: t('about.roadmap.phase5_title', 'Predictive Analytics & Mobile Apps'),
      desc: t('about.roadmap.phase5_desc', 'Deep learning predictive algorithms for flock feed conversions and dedicated iOS/Android applications.'),
      status: 'upcoming',
      date: 'Q1 2027'
    }
  ]

  return (
    <AppShell 
      title={t('about.title', 'About Founder & Vision')} 
      subtitle={t('about.subtitle', 'Explore the startup roadmap, technological innovations, and the creator behind PoultryPro OS')}
    >
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-12 pb-12"
      >
        {/* 1. HERO SECTION */}
        <motion.section 
          variants={itemVariants} 
          className="relative overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br from-white/90 via-white/80 to-emerald-50/50 p-6 md:p-10 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:from-slate-950/90 dark:via-slate-900/80 dark:to-emerald-950/20"
        >
          {/* Animated background gradient orbs */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-400/5 animate-pulse" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-400/5" />

          <div className="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            
            {/* Left: Headline & Bio Info */}
            <div className="space-y-6 lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-350">
                <Flame className="h-3.5 w-3.5 text-orange-500" />
                {t('about.hero_badge', 'Founder & Developer Presentation')}
              </div>

              <h2 className="font-heading text-3xl font-black leading-tight tracking-tight text-surface-950 dark:text-white sm:text-4xl md:text-5xl">
                {t('about.hero_headline', 'Building AI-Powered solutions for the future of Indian poultry farming.')}
              </h2>

              <p className="text-sm font-semibold leading-relaxed text-surface-650 dark:text-slate-350">
                {t('about.hero_tagline', 'Bridging the technological divide in rural agriculture through smart telemetry, automated disease scanning, and multilingual voice-activated farming interfaces.')}
              </p>

              {/* Stats badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                <div className="rounded-2xl border border-surface-200/50 bg-white/50 p-3 dark:border-white/5 dark:bg-white/[0.02]">
                  <span className="block text-xs font-black text-emerald-600 dark:text-emerald-450 uppercase tracking-wider">Sailada Prasant Kumar</span>
                  <span className="text-[10px] text-surface-500 dark:text-slate-400 font-semibold">{t('about.identity.name_sub', 'Founder & Developer')}</span>
                </div>
                <div className="rounded-2xl border border-surface-200/50 bg-white/50 p-3 dark:border-white/5 dark:bg-white/[0.02]">
                  <span className="block text-xs font-black text-emerald-600 dark:text-emerald-450 uppercase tracking-wider">B.Tech Student</span>
                  <span className="text-[10px] text-surface-500 dark:text-slate-400 font-semibold">{t('about.identity.college_sub', 'AI & Agritech Innovator')}</span>
                </div>
                <div className="col-span-2 sm:col-span-1 rounded-2xl border border-surface-200/50 bg-white/50 p-3 dark:border-white/5 dark:bg-white/[0.02]">
                  <span className="block text-xs font-black text-emerald-600 dark:text-emerald-450 uppercase tracking-wider">PoultryPro OS</span>
                  <span className="text-[10px] text-surface-500 dark:text-slate-400 font-semibold">{t('about.identity.project_sub', 'Startup Platform')}</span>
                </div>
              </div>
            </div>

            {/* Right: Portrait Graphic */}
            <div className="flex justify-center lg:col-span-5">
              <div className="relative group">
                {/* Glow ring */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 opacity-20 blur-xl transition group-hover:opacity-40" />
                
                {/* Image frame */}
                <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-white p-2.5 shadow-2xl dark:border-white/10 dark:bg-slate-900">
                  <img 
                    src="/founder.jpg" 
                    alt="Sailada Prasant Kumar" 
                    className="h-72 w-72 md:h-80 md:w-80 rounded-2xl object-cover transition-transform duration-500 group-hover:scale-102"
                    onError={(e) => {
                      // Fallback avatar graphic if image fails to load
                      e.target.style.display = 'none';
                      document.getElementById('avatar-fallback').style.display = 'flex';
                    }}
                  />
                  {/* Fallback visual avatar */}
                  <div 
                    id="avatar-fallback"
                    className="hidden h-72 w-72 md:h-80 md:w-80 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-950 flex-col items-center justify-center text-white"
                  >
                    <Users className="h-16 w-16 mb-2 text-emerald-250 animate-bounce" />
                    <span className="font-heading text-lg font-black tracking-tight">SPK</span>
                    <span className="text-xs text-emerald-300 font-bold mt-1">Sailada Prasant Kumar</span>
                  </div>

                  {/* Absolute overlay tag */}
                  <div className="absolute bottom-6 right-6 flex items-center gap-1.5 rounded-xl bg-slate-950/80 px-3 py-1.5 text-[9px] font-black text-white uppercase tracking-wider backdrop-blur-md">
                    <Sparkles className="h-3 w-3 text-emerald-400" />
                    {t('about.active_tag', 'Creator Active')}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </motion.section>

        {/* 2. FOUNDER INTRODUCTION & MISSION STATEMENT */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          
          {/* Bio card */}
          <motion.div 
            variants={itemVariants}
            className="rounded-2xl border border-white/70 bg-white/70 p-6 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055] lg:col-span-7 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <h3 className="font-heading text-lg font-black tracking-tight text-surface-950 dark:text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-500" />
                {t('about.bio_title', 'Founder Biography & Journey')}
              </h3>
              <p className="text-xs font-semibold leading-relaxed text-surface-650 dark:text-slate-350">
                {t('about.bio_text1', 'Sailada Prasant Kumar is a dedicated B.Tech student and founder of PoultryPro, an AI-powered smart poultry farming platform. With a strong interest in AI and Agritech, Prasant noticed that local farmers face heavy operational constraints—ranging from technical barriers to regional language exclusions and unexpected disease mortality outbreaks.')}
              </p>
              <p className="text-xs font-semibold leading-relaxed text-surface-650 dark:text-slate-350">
                {t('about.bio_text2', 'To solve this, he developed PoultryPro OS, combining modern web frameworks with smart speech synthesis, automated alerts, and camera diagnostics to democratize agritech tools. His startup roadmap focuses on deploying accessible, robust technology designed to protect livelihoods and optimize livestock feed conversions.')}
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">#AgritechStartup</span>
              <span className="rounded-full bg-blue-500/10 px-3 py-1 text-[10px] font-extrabold text-blue-600 dark:text-blue-400">#AIPoultry</span>
              <span className="rounded-full bg-purple-500/10 px-3 py-1 text-[10px] font-extrabold text-purple-600 dark:text-purple-400">#RuralInclusion</span>
            </div>
          </motion.div>

          {/* Vision/Mission Double Cards */}
          <motion.div 
            variants={itemVariants}
            className="lg:col-span-5 flex flex-col gap-6"
          >
            {/* Vision Card */}
            <div className="relative group overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br from-emerald-600 to-green-800 p-5 shadow-xl text-white">
              <div className="absolute -right-6 -bottom-6 h-20 w-20 rounded-full bg-white/10 blur-xl group-hover:scale-125 transition-transform" />
              <div className="flex items-center gap-3 mb-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white">
                  <Target className="h-5 w-5" />
                </span>
                <h4 className="font-heading text-sm font-black tracking-wider uppercase">{t('about.vision_title', 'Startup Vision')}</h4>
              </div>
              <p className="text-xs font-semibold leading-normal text-emerald-100">
                "{t('about.vision_desc', 'To empower Indian poultry farmers through affordable, localized, AI-powered smart farming technologies that maximize livestock safety and operations.')}"
              </p>
            </div>

            {/* Mission Card */}
            <div className="relative group overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br from-teal-650 to-emerald-900 p-5 shadow-xl text-white dark:border-white/10">
              <div className="absolute -right-6 -bottom-6 h-20 w-20 rounded-full bg-white/10 blur-xl group-hover:scale-125 transition-transform" />
              <div className="flex items-center gap-3 mb-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white">
                  <Eye className="h-5 w-5" />
                </span>
                <h4 className="font-heading text-sm font-black tracking-wider uppercase">{t('about.mission_title', 'Startup Mission')}</h4>
              </div>
              <p className="text-xs font-semibold leading-normal text-emerald-100">
                "{t('about.mission_desc', 'To build a multilingual intelligent poultry ecosystem accessible even to rural village farmers, bypassing literacy and hardware accessibility gaps.')}"
              </p>
            </div>
          </motion.div>

        </div>

        {/* 3. WHY POULTRYPRO EXISTS */}
        <motion.section 
          variants={itemVariants}
          className="rounded-3xl border border-white/70 bg-white/70 p-6 md:p-8 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055]"
        >
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <h3 className="font-heading text-2xl font-black tracking-tight text-surface-950 dark:text-white">
              {t('about.why_exists_title', 'Why PoultryPro Exists')}
            </h3>
            <p className="text-xs text-surface-550 dark:text-slate-400 font-semibold leading-relaxed">
              {t('about.why_exists_desc', 'Agricultural progress in India is heavily slowed by digital barriers. PoultryPro provides key systems to solve the core bottlenecks of rural livestock farming.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Item 1 */}
            <div className="p-5 rounded-2xl border border-surface-200/50 bg-white/45 dark:border-white/5 dark:bg-white/[0.02] space-y-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-350">
                <Languages className="h-5 w-5" />
              </span>
              <h4 className="text-xs font-black text-surface-950 dark:text-white uppercase tracking-wider">
                {t('about.challenges.language_title', 'Language Barriers')}
              </h4>
              <p className="text-[11px] font-semibold text-surface-555 dark:text-slate-400 leading-relaxed">
                {t('about.challenges.language_desc', 'Standard agricultural dashboards are presented only in English, isolating over 80% of Indian farmers. PoultryPro implements 7 Indian languages with text and voice output.')}
              </p>
            </div>

            {/* Item 2 */}
            <div className="p-5 rounded-2xl border border-surface-200/50 bg-white/45 dark:border-white/5 dark:bg-white/[0.02] space-y-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-350">
                <Camera className="h-5 w-5" />
              </span>
              <h4 className="text-xs font-black text-surface-950 dark:text-white uppercase tracking-wider">
                {t('about.challenges.disease_title', 'Flock Disease Outbreaks')}
              </h4>
              <p className="text-[11px] font-semibold text-surface-555 dark:text-slate-400 leading-relaxed">
                {t('about.challenges.disease_desc', 'Late identification of diseases like Coccidiosis or Newcastle causes extreme financial loss. Our camera scanner lets farmers snapshot symptoms and get instant local protocols.')}
              </p>
            </div>

            {/* Item 3 */}
            <div className="p-5 rounded-2xl border border-surface-200/50 bg-white/45 dark:border-white/5 dark:bg-white/[0.02] space-y-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-350">
                <Mic className="h-5 w-5" />
              </span>
              <h4 className="text-xs font-black text-surface-950 dark:text-white uppercase tracking-wider">
                {t('about.challenges.assist_title', 'Vocal AI Guidance')}
              </h4>
              <p className="text-[11px] font-semibold text-surface-555 dark:text-slate-400 leading-relaxed">
                {t('about.challenges.assist_desc', 'Typing search queries is difficult for low-literacy farmers. A simple microphone button triggers speech-to-text input, and the AI answers out loud instantly.')}
              </p>
            </div>

          </div>
        </motion.section>

        {/* 4. TECH STACK & SKILLS */}
        <motion.section 
          variants={itemVariants}
          className="grid grid-cols-1 gap-6 lg:grid-cols-12"
        >
          {/* Left Column: Tech Stack description */}
          <div className="rounded-2xl border border-white/70 bg-white/70 p-6 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055] lg:col-span-5 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-heading text-lg font-black tracking-tight text-surface-950 dark:text-white flex items-center gap-2">
                <Layers className="h-5 w-5 text-emerald-500" />
                {t('about.tech_stack_title', 'Agritech Technology Provision')}
              </h3>
              <p className="text-xs font-semibold leading-relaxed text-surface-650 dark:text-slate-350">
                {t('about.tech_stack_desc', 'PoultryPro uses lightweight client-side wrappers, structured cloud storage databases, and Web Speech APIs to perform robust operations directly in the browser.')}
              </p>
              <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 leading-relaxed">
                {t('about.tech_stack_note', 'Note: In regions with low internet network coverage, the system fallback algorithm auto-switches to local database sandboxes to prevent crop telemetry loss.')}
              </div>
            </div>
            
            <div className="pt-6 border-t border-surface-200/50 dark:border-white/5 flex items-center gap-3">
              <span className="text-xs font-bold text-surface-500 dark:text-slate-450">{t('about.deployment_tag', 'Deployment Target:')}</span>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-450 flex items-center gap-1">
                Vercel Serverless Edge
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>

          {/* Right Column: Skill categories list */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-6">
            {skillCategories.map((category) => {
              const Icon = category.icon
              return (
                <div 
                  key={category.title}
                  className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055] flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${category.color} text-white shadow-md`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-surface-950 dark:text-white uppercase tracking-wider">{category.title}</h4>
                      <div className="mt-3.5 space-y-2">
                        {category.skills.map((skill) => (
                          <div key={skill} className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[11px] font-bold text-surface-700 dark:text-slate-350">{skill}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.section>

        {/* 5. ROADMAP SECTION */}
        <motion.section 
          variants={itemVariants}
          className="rounded-3xl border border-white/70 bg-white/70 p-6 md:p-8 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.055]"
        >
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <h3 className="font-heading text-2xl font-black tracking-tight text-surface-950 dark:text-white flex items-center justify-center gap-2">
              <Rocket className="h-6 w-6 text-emerald-500" />
              {t('about.roadmap_title', 'Agritech Startup Roadmap')}
            </h3>
            <p className="text-xs text-surface-550 dark:text-slate-400 font-semibold leading-relaxed">
              {t('about.roadmap_desc', 'Our development phases trace the scaling of PoultryPro from a cloud-connected dashboard to a complete IoT physical sensor ecosystem.')}
            </p>
          </div>

          {/* Timeline UI */}
          <div className="relative border-l-2 border-emerald-500/20 dark:border-emerald-500/10 ml-4 md:ml-8 space-y-8">
            {roadmapSteps.map((step, index) => (
              <div key={index} className="relative pl-6 md:pl-8 group">
                {/* Timeline node dot */}
                <div 
                  className={cn(
                    "absolute -left-2.5 top-1.5 h-5 w-5 rounded-full border-4 border-white dark:border-slate-950 shadow-md transition-transform duration-300 group-hover:scale-110",
                    step.status === 'completed' 
                      ? "bg-emerald-500 ring-2 ring-emerald-500/15" 
                      : "bg-surface-200 dark:bg-slate-800"
                  )} 
                />

                <div className="p-5 rounded-2xl border border-surface-200/50 bg-white/45 dark:border-white/5 dark:bg-white/[0.02] flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 md:max-w-xl">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-450">
                        {step.phase}
                      </span>
                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-surface-150 text-surface-650 dark:bg-white/5 dark:text-slate-400">
                        {step.date}
                      </span>
                      {step.status === 'completed' && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[8px] font-black uppercase text-emerald-600 dark:text-emerald-350">
                          <Check className="h-2 w-2" />
                          {t('about.status.completed', 'Live')}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-black text-surface-950 dark:text-white uppercase tracking-wider">
                      {step.title}
                    </h4>
                    <p className="text-[11px] font-semibold text-surface-555 dark:text-slate-400 leading-normal">
                      {step.desc}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center">
                    <span 
                      className={cn(
                        "text-xs font-bold px-3 py-1.5 rounded-xl border",
                        step.status === 'completed'
                          ? "border-emerald-250 bg-emerald-500/5 text-emerald-600 dark:border-emerald-500/15 dark:text-emerald-400"
                          : "border-surface-200 bg-white/50 text-surface-450 dark:border-white/5 dark:bg-slate-900/50 dark:text-slate-500"
                      )}
                    >
                      {step.status === 'completed' ? t('about.status.ready', 'Ready') : t('about.status.scheduled', 'Scheduled')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 6. CONTACT & SOCIAL PRESENTATION */}
        <motion.section 
          variants={itemVariants}
          className="rounded-3xl border border-white/70 bg-gradient-to-br from-white/95 to-slate-50/50 p-6 md:p-8 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:from-slate-950 dark:to-slate-900/50"
        >
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            
            <div className="space-y-4 lg:col-span-6">
              <h3 className="font-heading text-xl font-black tracking-tight text-surface-950 dark:text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-500" />
                {t('about.contact_title', 'Connect with the Founder')}
              </h3>
              <p className="text-xs font-semibold leading-relaxed text-surface-550 dark:text-slate-400">
                {t('about.contact_desc', 'Whether you are interested in investment, research collaborations, agricultural tech deployments, or simply checking out the codebase, feel free to connect across our professional networks.')}
              </p>

              {/* Copy Cards */}
              <div className="space-y-2.5 max-w-sm pt-2">
                
                {/* Email Copy Item */}
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-surface-200/50 bg-white/50 dark:border-white/5 dark:bg-white/[0.02] text-xs">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-emerald-500" />
                    <span className="font-bold text-surface-800 dark:text-slate-300">sailadaprasantkumar767@gmail.com</span>
                  </div>
                  <button
                    onClick={() => handleCopy('sailadaprasantkumar767@gmail.com', 'Email')}
                    className="p-1.5 rounded-lg bg-surface-150 hover:bg-surface-200 dark:bg-white/5 dark:hover:bg-white/10 text-surface-600 dark:text-slate-400 transition"
                    title="Copy Email"
                  >
                    {copiedText === 'Email' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>

                {/* Portfolio Copy Item */}
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-surface-200/50 bg-white/50 dark:border-white/5 dark:bg-white/[0.02] text-xs">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-emerald-500" />
                    <span className="font-bold text-surface-800 dark:text-slate-300">prasantkumar.dev</span>
                  </div>
                  <button
                    onClick={() => handleCopy('https://prasantkumar.dev', 'Portfolio Link')}
                    className="p-1.5 rounded-lg bg-surface-150 hover:bg-surface-200 dark:bg-white/5 dark:hover:bg-white/10 text-surface-600 dark:text-slate-400 transition"
                    title="Copy Portfolio URL"
                  >
                    {copiedText === 'Portfolio Link' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>

              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Github Card */}
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noreferrer"
                className="group p-5 rounded-2xl border border-surface-200 bg-white shadow-md hover:border-emerald-500 transition-all dark:border-white/5 dark:bg-slate-900/60 dark:hover:border-emerald-500 flex flex-col justify-between h-36"
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-350">
                    <Code className="h-5 w-5" />
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-surface-400 group-hover:text-emerald-500 transition-colors" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-surface-950 dark:text-white uppercase tracking-wider">GitHub Profile</h4>
                  <p className="text-[10px] text-surface-500 dark:text-slate-450 mt-0.5 font-bold">Review repository files & code releases</p>
                </div>
              </a>

              {/* LinkedIn Card */}
              <a 
                href="https://www.linkedin.com/in/sailada-prasant-kumar" 
                target="_blank" 
                rel="noreferrer"
                className="group p-5 rounded-2xl border border-surface-200 bg-white shadow-md hover:border-emerald-500 transition-all dark:border-white/5 dark:bg-slate-900/60 dark:hover:border-emerald-500 flex flex-col justify-between h-36"
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-350">
                    <Briefcase className="h-5 w-5" />
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-surface-400 group-hover:text-emerald-500 transition-colors" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-surface-950 dark:text-white uppercase tracking-wider">LinkedIn Professional</h4>
                  <p className="text-[10px] text-surface-500 dark:text-slate-450 mt-0.5 font-bold">Connect on professional network matrices</p>
                </div>
              </a>

            </div>

          </div>
        </motion.section>

      </motion.div>
    </AppShell>
  )
}
