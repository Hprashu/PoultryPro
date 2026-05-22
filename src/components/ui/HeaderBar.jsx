import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Menu, Moon, Search, Sparkles, Sun } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../contexts/ThemeContext.jsx'
import useNotifications from '../../hooks/useNotifications.js'
import NotificationPanel from './NotificationPanel.jsx'

export default function HeaderBar({ title, subtitle, onMenuClick, actions, userInitials }) {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { isDark, toggleTheme } = useTheme()
  const { notifications, unreadCount, markRead, markAllRead, clearAll } = useNotifications()
  const [panelOpen, setPanelOpen] = useState(false)
  const [langDropdownOpen, setLangDropdownOpen] = useState(false)

  const getLocalizedTitle = (rawTitle) => {
    if (!rawTitle) return '';
    const titleStr = String(rawTitle).trim().toLowerCase();
    const titleMap = {
      'dashboard': 'nav.dashboard',
      'command center': 'nav.dashboard',
      'flock manager': 'nav.poultry_manager',
      'poultry manager': 'nav.poultry_manager',
      'smart environment': 'nav.smart_environment',
      'smart environment monitor': 'nav.smart_environment',
      'smart scheduling': 'nav.smart_scheduling',
      'ai health intelligence': 'nav.health_intel',
      'ai health intel': 'nav.health_intel',
      'health intelligence': 'nav.health_intel',
      'disease scanner': 'nav.disease_scanner',
      'ai disease scanner': 'nav.disease_scanner',
      'business analytics': 'nav.business_analytics',
      'farm marketplace': 'nav.marketplace',
      'marketplace': 'nav.marketplace',
      'smart automation control': 'nav.automation',
      'smart automation': 'nav.automation',
      'settings': 'nav.settings',
      'user & farm settings': 'nav.settings',
      'about founder': 'nav.about_founder',
      'about-founder': 'nav.about_founder',
      'founder portfolio': 'nav.about_founder',
      'feed inventory': 'nav.feed',
      'biosecurity & ai gallery': 'nav.images',
      'image gallery': 'nav.images'
    };

    const key = titleMap[titleStr];
    return key ? t(key) : t(rawTitle, rawTitle);
  };

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'te', label: 'తెలుగు', flag: '🇮🇳' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' },
    { code: 'kn', label: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'mr', label: 'मराठी', flag: '🇮🇳' },
    { code: 'bn', label: 'বাংলা', flag: '🇮🇳' }
  ]

  const activeLang = languages.find(l => l.code === i18n.language) || languages[0]

  const changeLanguage = (code) => {
    i18n.changeLanguage(code)
    localStorage.setItem('poultrypro-language', code)
    setLangDropdownOpen(false)
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-white/72 px-4 py-3 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/58 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="grid h-10 w-10 place-items-center rounded-lg border border-surface-200 bg-white text-surface-600 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="hidden h-8 w-8 place-items-center rounded-lg bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200 sm:grid">
                <Sparkles className="h-4 w-4" />
              </span>
              <h1 className="truncate font-heading text-xl font-black tracking-tight text-surface-950 dark:text-white sm:text-2xl">
                {getLocalizedTitle(title)}
              </h1>
            </div>
            {subtitle && <p className="mt-0.5 hidden truncate text-sm text-surface-500 dark:text-slate-400 sm:block">{subtitle}</p>}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <label className="hidden h-10 items-center gap-2 rounded-lg border border-surface-200 bg-white/80 px-3 text-surface-500 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-400 md:flex">
            <Search className="h-4 w-4" />
            <input
              type="search"
              placeholder="Search farm data"
              className="w-40 bg-transparent text-sm text-surface-800 outline-none placeholder:text-surface-400 dark:text-white dark:placeholder:text-slate-500"
            />
          </label>
          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex h-10 items-center gap-1.5 rounded-lg border border-surface-200 bg-white px-2.5 text-xs font-black text-surface-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
              aria-label="Select language"
            >
              <span className="text-base leading-none">{activeLang.flag}</span>
              <span className="hidden sm:inline font-bold">{activeLang.label}</span>
            </button>
            <AnimatePresence>
              {langDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLangDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-1.5 z-50 w-40 rounded-xl border border-surface-200 bg-white/95 p-1.5 shadow-xl backdrop-blur-lg dark:border-white/10 dark:bg-slate-900/95"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => changeLanguage(lang.code)}
                        className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-bold transition hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 ${
                          i18n.language === lang.code ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'text-surface-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="text-sm leading-none">{lang.flag}</span>
                        <span>{lang.label}</span>
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="grid h-10 w-10 place-items-center rounded-lg border border-surface-200 bg-white text-surface-600 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-emerald-200"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          
          <div className="relative flex items-center">
            <motion.button
              type="button"
              whileHover={{ y: -1 }}
              onClick={() => navigate('/notifications')}
              className="relative grid h-10 w-10 place-items-center rounded-l-lg border border-r-0 border-surface-200 bg-white text-surface-600 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-black text-white ring-2 ring-white dark:ring-slate-950">
                  {unreadCount}
                </span>
              )}
            </motion.button>
            <button
              type="button"
              onClick={() => setPanelOpen((prev) => !prev)}
              className="grid h-10 w-5 place-items-center rounded-r-lg border border-surface-200 bg-white text-surface-500 hover:text-emerald-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
              title="Quick notifications panel"
            >
              <span className="text-[8px]">▼</span>
            </button>
          </div>

          <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-emerald-500 to-green-800 text-sm font-black text-white shadow-lg shadow-emerald-700/20">
            {userInitials}
          </div>
          {actions}
        </div>
      </div>

      <AnimatePresence>
        {panelOpen && (
          <motion.div
            initial={{ opacity: 0, x: 280 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed inset-y-0 right-0 z-50"
          >
            <NotificationPanel
              notifications={notifications}
              unreadCount={unreadCount}
              markRead={markRead}
              markAllRead={markAllRead}
              clearAll={clearAll}
              onClose={() => setPanelOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

