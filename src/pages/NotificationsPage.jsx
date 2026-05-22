import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, AlertTriangle, AlertCircle, Info, Check, Trash2, 
  Filter, ShieldAlert, Sparkles, CheckSquare, Calendar, ChevronRight
} from 'lucide-react';
import AppShell from '../components/ui/AppShell.jsx';
import { useNotifications } from '../contexts/NotificationContext.jsx';
import { cn } from '../lib/ui.js';

export default function NotificationsPage() {
  const { t } = useTranslation();
  const { 
    notifications, 
    unreadCount, 
    markRead, 
    markAllRead, 
    clearAll, 
    loading 
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'unread', 'critical', 'warning'

  // Calculate statistics
  const stats = useMemo(() => {
    const total = notifications.length;
    const critical = notifications.filter(n => n.type === 'critical').length;
    const warning = notifications.filter(n => n.type === 'warning').length;
    const info = notifications.filter(n => n.type === 'info').length;
    return { total, critical, warning, info, unread: unreadCount };
  }, [notifications, unreadCount]);

  // Filter notifications list
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (activeFilter === 'unread') return !n.read;
      if (activeFilter === 'critical') return n.type === 'critical';
      if (activeFilter === 'warning') return n.type === 'warning';
      return true;
    });
  }, [notifications, activeFilter]);

  // Helper for icons based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'critical':
        return <AlertCircle className="h-5.5 w-5.5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5.5 w-5.5 text-amber-500" />;
      case 'info':
      default:
        return <Info className="h-5.5 w-5.5 text-sky-500" />;
    }
  };

  // Format timestamp humanely
  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  return (
    <AppShell>
      <div className="relative min-h-[calc(100vh-4rem)] p-4 lg:p-8 bg-surface-50 dark:bg-slate-950">
        {/* Glow ambient background assets */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-1/4 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl" />
          <div className="absolute bottom-10 left-1/4 h-72 w-72 rounded-full bg-amber-500/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl relative z-10 flex flex-col gap-6">
          {/* Header Title Area */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-white/60 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-slate-900/50">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/20">
                <Bell className="h-7 w-7" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-black text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                  <ShieldAlert className="h-3 w-3" />
                  Farm Alert Monitor
                </span>
                <h1 className="font-heading text-2xl font-black text-surface-950 dark:text-white mt-1">
                  {t('notifications.title', 'Alarms & Notifications')}
                </h1>
                <p className="text-sm font-semibold text-surface-500 dark:text-slate-400">
                  Real-time alerts regarding diseases, low feed levels, climate shifts, and vaccinations.
                </p>
              </div>
            </div>

            {notifications.length > 0 && (
              <div className="flex items-center gap-2 self-start md:self-center">
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-2 rounded-xl border border-surface-200 bg-white hover:bg-surface-50 hover:text-emerald-600 px-4 py-2.5 text-xs font-black text-surface-700 shadow-sm transition dark:border-white/10 dark:bg-white/5 dark:text-slate-350 dark:hover:bg-white/10"
                >
                  <CheckSquare className="h-4 w-4" />
                  <span>Mark All Read</span>
                </button>
                <button
                  onClick={clearAll}
                  className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 text-xs font-black shadow-sm transition dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Clear All</span>
                </button>
              </div>
            )}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Active Unread", value: stats.unread, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
              { label: "Critical Alarms", value: stats.critical, color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10" },
              { label: "System Warnings", value: stats.warning, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
              { label: "Info Alerts", value: stats.info, color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-500/10" }
            ].map((stat, idx) => (
              <div key={idx} className="rounded-xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-slate-900/50">
                <p className="text-[10px] font-black text-surface-400 dark:text-slate-500 uppercase tracking-wider">{stat.label}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={cn("text-2xl font-heading font-black", stat.color)}>{stat.value}</span>
                  <span className={cn("inline-block h-2 w-2 rounded-full", stat.bg)} />
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Pane */}
          <div className="rounded-2xl border border-white/60 bg-white/70 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-slate-900/50 overflow-hidden">
            {/* Filter Tabs */}
            <div className="flex border-b border-surface-150 px-6 py-4 dark:border-white/5 items-center justify-between">
              <div className="flex items-center gap-1 bg-surface-100 dark:bg-white/5 p-1 rounded-xl">
                {[
                  { id: 'all', label: 'All Alerts' },
                  { id: 'unread', label: `Unread (${stats.unread})` },
                  { id: 'critical', label: 'Critical' },
                  { id: 'warning', label: 'Warnings' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id)}
                    className={cn(
                      "rounded-lg px-3.5 py-1.5 text-xs font-black transition",
                      activeFilter === tab.id
                        ? "bg-white text-emerald-600 shadow-sm dark:bg-slate-900 dark:text-white"
                        : "text-surface-500 hover:text-surface-800 dark:text-slate-400 dark:hover:text-white"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="hidden sm:flex items-center gap-1.5 text-xs text-surface-450 dark:text-slate-500 font-semibold">
                <Filter className="h-3.5 w-3.5" />
                <span>Filter active feed</span>
              </div>
            </div>

            {/* Notification logs list */}
            <div className="p-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="flex gap-4 p-4 rounded-xl border border-surface-150 bg-white/50 dark:border-white/5 dark:bg-white/2 animate-pulse">
                      <div className="h-10 w-10 bg-surface-200 dark:bg-white/5 rounded-xl shrink-0" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-surface-200 dark:bg-white/5 rounded w-1/4" />
                        <div className="h-3 bg-surface-200 dark:bg-white/5 rounded w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/5 text-emerald-500 border border-emerald-500/10 mb-4 animate-bounce">
                    <Check className="h-8 w-8" />
                  </div>
                  <h3 className="font-heading text-base font-black text-surface-900 dark:text-white">
                    All clear!
                  </h3>
                  <p className="text-xs text-surface-450 dark:text-slate-500 mt-1 max-w-xs font-semibold leading-normal">
                    No matching farming alarms active. Ensure smart sensors and thresholds are configured.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  <AnimatePresence initial={false}>
                    {filteredNotifications.map((notif) => (
                      <motion.div
                        key={notif.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        className={cn(
                          "relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border transition shadow-sm",
                          notif.read 
                            ? "border-surface-150 bg-white/40 opacity-75 dark:border-white/5 dark:bg-white/1"
                            : "border-white bg-white hover:shadow-md dark:border-white/5 dark:bg-slate-900/40",
                          !notif.read && notif.type === 'critical' && "border-red-500/20 bg-gradient-to-r from-red-500/5 to-transparent",
                          !notif.read && notif.type === 'warning' && "border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-transparent"
                        )}
                      >
                        {/* Icon & Details */}
                        <div className="flex items-start gap-3.5">
                          <div className={cn(
                            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border shadow-sm",
                            notif.type === 'critical' 
                              ? 'border-red-100 bg-red-50 dark:border-red-500/10 dark:bg-red-500/10' 
                              : notif.type === 'warning'
                                ? 'border-amber-100 bg-amber-50 dark:border-amber-500/10 dark:bg-amber-500/10'
                                : 'border-sky-100 bg-sky-50 dark:border-sky-500/10 dark:bg-sky-500/10'
                          )}>
                            {getNotificationIcon(notif.type)}
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className={cn(
                                "font-black text-sm text-surface-900 dark:text-white leading-snug",
                                !notif.read && "font-black"
                              )}>
                                {notif.title}
                              </h4>
                              {notif.category && (
                                <span className="inline-block rounded-md bg-surface-150 px-1.5 py-0.5 text-[9px] font-bold text-surface-600 dark:bg-white/5 dark:text-slate-400">
                                  {notif.category}
                                </span>
                              )}
                              {!notif.read && (
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              )}
                            </div>
                            <p className="text-xs text-surface-500 dark:text-slate-400 mt-1 leading-relaxed font-semibold">
                              {notif.detail}
                            </p>
                          </div>
                        </div>

                        {/* Action buttons & time */}
                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-surface-100 dark:border-white/5 shrink-0">
                          <div className="flex items-center gap-1.5 text-[10px] text-surface-400 dark:text-slate-500 font-bold">
                            <Calendar className="h-3 w-3" />
                            <span>{formatTime(notif.createdAt)}</span>
                          </div>

                          {!notif.read && (
                            <button
                              onClick={() => markRead(notif.id)}
                              className="flex items-center gap-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400 px-3 py-1.5 text-xs font-black transition"
                              title="Mark as Read"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>Read</span>
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
