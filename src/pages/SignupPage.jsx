import React, { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail, User } from 'lucide-react'
import AuthShell from '../components/ui/AuthShell.jsx'
import { auth, createUserWithEmailAndPassword, updateProfile, signInWithPopup, googleProvider } from '../firebase'
import { useAuth } from '../contexts/AuthContext.jsx'
import { cn } from '../lib/ui'
import { getAuthErrorMessage, redirectToLocalhostForGoogleAuth } from '../lib/authDomain'

/* ─── Firebase error map ─── */
const ERROR_MAP = {
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
  'auth/operation-not-allowed': 'Email/password accounts not enabled. Contact support.',
  'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
  'auth/network-request-failed': 'Network error. Check your connection.',
  'auth/popup-closed-by-user': 'Google sign-up was cancelled.',
}

function getError(err) {
  return getAuthErrorMessage(err) || ERROR_MAP[err.code] || err.message || 'An unexpected error occurred.'
}

/* ─── Password strength ─── */
function getStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' }
  let s = 0
  if (pw.length >= 6) s++
  if (pw.length >= 8) s++
  if (/[A-Z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return [
    { label: '', color: '' },
    { label: 'Weak', color: 'bg-red-500' },
    { label: 'Fair', color: 'bg-orange-500' },
    { label: 'Good', color: 'bg-amber-500' },
    { label: 'Strong', color: 'bg-emerald-500' },
    { label: 'Excellent', color: 'bg-emerald-600' },
  ].map((l, i) => ({ ...l, score: i }))[s]
}

/* ─── Floating Input ─── */
function FloatingInput({ id, name, type = 'text', label, icon: Icon, value, onChange, error, rightSlot, ...rest }) {
  const [focused, setFocused] = useState(false)
  const filled = value != null && String(value).length > 0

  return (
    <div className="mb-4">
      <div
        className={cn(
          'group relative flex items-center rounded-xl border px-4 transition-all duration-300',
          'bg-slate-50/80 dark:bg-white/[0.03]',
          'h-[52px]',
          focused
            ? 'border-emerald-500 ring-[3px] ring-emerald-500/8 shadow-sm shadow-emerald-500/5'
            : error
              ? 'border-red-400/70 ring-[3px] ring-red-500/8'
              : 'border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.14]',
        )}
      >
        {Icon && (
          <Icon className={cn(
            'mr-3 h-[18px] w-[18px] shrink-0 transition-colors duration-200',
            focused ? 'text-emerald-500' : error ? 'text-red-400' : 'text-slate-400 dark:text-slate-500',
          )} />
        )}
        <div className="relative flex-1 h-full flex items-center">
          <input
            id={id} name={name} type={type} value={value} onChange={onChange}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            placeholder=" "
            className="peer block w-full bg-transparent pt-3 pb-0 text-[13px] font-semibold text-slate-900 placeholder-transparent focus:outline-none focus:ring-0 dark:text-white"
            {...rest}
          />
          <label htmlFor={id}
            className={cn(
              'pointer-events-none absolute left-0 origin-[0] transition-all duration-200 select-none',
              (focused || filled)
                ? 'top-1.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-emerald-600 dark:text-emerald-400'
                : 'top-1/2 -translate-y-1/2 text-[13px] font-semibold text-slate-400 dark:text-slate-500',
            )}
          >
            {label}
          </label>
        </div>
        {rightSlot && <div className="ml-2 shrink-0 flex items-center">{rightSlot}</div>}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -4, height: 0 }}
            className="mt-1 pl-1 text-[11px] font-semibold text-red-500"
          >{error}</motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SIGNUP PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function SignupPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [showPw, setShowPw] = useState(false)
  const [showCpw, setShowCpw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  const strength = getStrength(form.password)

  const set = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }))
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.fullName.trim()) e.fullName = 'Full name is required'
    else if (form.fullName.trim().length < 2) e.fullName = 'At least 2 characters'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'At least 6 characters'
    if (!form.confirmPassword) e.confirmPassword = 'Confirm your password'
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    if (!agreeTerms) e.terms = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true); setErrors({})
    try {
      const { user: u } = await createUserWithEmailAndPassword(auth, form.email, form.password)
      await updateProfile(u, { displayName: form.fullName })
      navigate('/dashboard')
    } catch (err) { setErrors({ general: getError(err) }) }
    finally { setLoading(false) }
  }

  const handleGoogle = async () => {
    if (redirectToLocalhostForGoogleAuth()) return
    setLoading(true); setErrors({})
    try {
      await signInWithPopup(auth, googleProvider)
      navigate('/dashboard')
    } catch (err) { setErrors({ general: getError(err) }) }
    finally { setLoading(false) }
  }

  return (
    <AuthShell
      eyebrow="Join the farm intelligence network"
      title="Launch your smart"
      highlight="poultry workspace."
      description="Create a secure account, connect flock records, and unlock a modern AI cockpit for poultry operations."
      stats={[
        { value: '98%', label: 'Uptime SLA' },
        { value: '24/7', label: 'AI Monitoring' },
        { value: 'Live', label: 'Firebase Sync' },
      ]}
    >
      <Link to="/login" className="mb-5 inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 transition hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to login
      </Link>

      <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">Create account</p>
      <h2 className="mt-1 font-heading text-[22px] font-black text-slate-900 dark:text-white">
        Start with <span className="text-emerald-600 dark:text-emerald-400">Poultry</span><span className="text-amber-500 dark:text-amber-400">Pro</span>
      </h2>
      <p className="mt-1 mb-5 text-[12px] text-slate-500 dark:text-slate-400">Set up your AI-powered farm management workspace.</p>

      {errors.general && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200/70 bg-red-50/60 p-3.5 dark:border-red-500/10 dark:bg-red-500/5"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <p className="text-[12px] font-semibold leading-relaxed text-red-700 dark:text-red-200">{errors.general}</p>
        </motion.div>
      )}

      {/* Google */}
      <button id="google-signup-btn" type="button" onClick={handleGoogle} disabled={loading}
        className="group flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-[1px] hover:border-emerald-200 hover:shadow-md hover:text-emerald-700 disabled:opacity-55 disabled:pointer-events-none dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06] dark:hover:text-white"
      >
        <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-[11px] font-black text-blue-600 shadow-sm ring-1 ring-slate-100 dark:ring-white/10">G</span>
        Sign up with Google
      </button>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-white/[0.07]" />
        <span className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">Account details</span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-white/[0.07]" />
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <FloatingInput id="fullName" name="fullName" label="Full name" icon={User} value={form.fullName} onChange={(e) => set('fullName', e.target.value)} error={errors.fullName} required />
        <FloatingInput id="signup-email" name="email" type="email" label="Email address" icon={Mail} value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} required />

        {/* password + strength */}
        <FloatingInput id="signup-password" name="password" type={showPw ? 'text' : 'password'} label="Password" icon={LockKeyhole}
          value={form.password} onChange={(e) => set('password', e.target.value)} error={errors.password} required
          rightSlot={
            <button type="button" tabIndex={-1} onClick={() => setShowPw((v) => !v)}
              className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-white"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />
        {form.password && (
          <div className="mb-4 -mt-2 px-1">
            <div className="flex gap-1">
              {[1,2,3,4,5].map((l) => (
                <div key={l} className={cn('h-1 flex-1 rounded-full transition-all', l <= strength.score ? strength.color : 'bg-slate-200 dark:bg-white/[0.07]')} />
              ))}
            </div>
            <p className="mt-1 text-[10px] font-bold text-slate-400 dark:text-slate-500">
              Strength: <span className={cn('font-extrabold', strength.score >= 4 ? 'text-emerald-500' : strength.score >= 2 ? 'text-amber-500' : 'text-red-500')}>{strength.label}</span>
            </p>
          </div>
        )}

        {/* confirm pw */}
        <FloatingInput id="confirmPassword" name="confirmPassword" type={showCpw ? 'text' : 'password'} label="Confirm password" icon={LockKeyhole}
          value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} error={errors.confirmPassword} required
          rightSlot={
            <div className="flex items-center gap-1">
              {form.confirmPassword && form.confirmPassword === form.password && <Check className="h-4 w-4 text-emerald-500" />}
              <button type="button" tabIndex={-1} onClick={() => setShowCpw((v) => !v)}
                className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-white"
              >
                {showCpw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          }
        />

        {/* terms */}
        <div className="mb-5 rounded-xl border border-slate-200/60 bg-slate-50/50 px-3.5 py-3 dark:border-white/[0.05] dark:bg-white/[0.02]">
          <button type="button" onClick={() => { setAgreeTerms((v) => !v); if (errors.terms) setErrors((c) => ({ ...c, terms: '' })) }}
            className="flex items-start gap-2.5 text-left text-[11px] font-bold leading-relaxed text-slate-600 dark:text-slate-400"
          >
            <span className={cn(
              'mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border transition',
              agreeTerms ? 'border-emerald-600 bg-emerald-600 text-white' : errors.terms ? 'border-red-300 bg-white dark:bg-white/5' : 'border-slate-300 bg-white dark:border-white/[0.12] dark:bg-white/5',
            )}>
              {agreeTerms && <Check className="h-2.5 w-2.5" />}
            </span>
            <span>I agree to the Terms of Service and Privacy Policy.</span>
          </button>
          {errors.terms && <p className="ml-6.5 mt-1 text-[10px] font-semibold text-red-500">{errors.terms}</p>}
        </div>

        <button
          id="signup-submit-btn" type="submit" disabled={loading}
          className="group relative flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-700 text-[11px] font-extrabold uppercase tracking-[0.12em] text-white shadow-lg shadow-emerald-700/20 transition-all duration-300 hover:-translate-y-[1px] hover:shadow-xl hover:shadow-emerald-600/25 active:translate-y-0 disabled:opacity-55 disabled:pointer-events-none"
        >
          {loading
            ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            : <><span>Create account</span><ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></>
          }
        </button>
      </form>

      <p className="mt-7 border-t border-slate-100 pt-5 text-center text-[12px] text-slate-500 dark:border-white/[0.06] dark:text-slate-400">
        Already have an account?{' '}
        <Link id="login-link" to="/login" className="font-bold text-emerald-600 underline decoration-emerald-500/30 underline-offset-[3px] transition hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}
