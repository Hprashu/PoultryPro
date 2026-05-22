import React from 'react'
import { AlertTriangle, RefreshCw, Trash2, Home } from 'lucide-react'

/**
 * Premium glassmorphic Error Boundary to catch render crashes
 * and display actionable diagnostic details.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    console.error('[ErrorBoundary] Caught runtime crash:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleClearCacheAndReload = () => {
    try {
      window.localStorage.clear()
      window.sessionStorage.clear()
      console.log('[ErrorBoundary] Cleared all local state storage.')
      window.location.href = '/'
    } catch (e) {
      console.error('Failed to clear storage:', e)
    }
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-900 text-slate-100 font-sans selection:bg-emerald-500/30">
          <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-white/10 pb-5">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-red-500/10 text-red-500 ring-1 ring-red-500/20">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                  System Crash Intercepted
                </h1>
                <p className="text-sm text-slate-400 mt-0.5">
                  PoultryPro Farm OS caught an unhandled interface exception.
                </p>
              </div>
            </div>

            {/* Error Body */}
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-red-400">Error Message</p>
                <p className="mt-1 text-sm font-semibold text-red-200">
                  {this.state.error?.toString() || 'Unknown runtime error'}
                </p>
              </div>

              {this.state.errorInfo && (
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Stack Trace</p>
                  <pre className="mt-2 max-h-48 overflow-y-auto rounded-lg bg-black/40 p-3 font-mono text-[11px] leading-relaxed text-slate-350">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-slate-700 active:scale-98"
              >
                <RefreshCw className="h-4 w-4" />
                Reload Interface
              </button>

              <button
                type="button"
                onClick={this.handleClearCacheAndReload}
                className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-red-200 transition hover:bg-red-500/20 active:scale-98"
              >
                <Trash2 className="h-4 w-4" />
                Clear Cache & Restart
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-emerald-700 active:scale-98 ml-auto"
              >
                <Home className="h-4 w-4" />
                Return Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
