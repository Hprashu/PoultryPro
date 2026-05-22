import React, { useState, useEffect, useCallback } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Fingerprint,
  LockKeyhole,
  Mail,
  Phone,
  RotateCcw,
  Smartphone,
} from 'lucide-react'
import AuthShell from '../components/ui/AuthShell.jsx'
import { auth, signInWithEmailAndPassword, signInWithPopup, googleProvider } from '../firebase'
import { RecaptchaVerifier, signInWithPhoneNumber, sendPasswordResetEmail } from 'firebase/auth'
import { useAuth } from '../contexts/AuthContext.jsx'
import { cn } from '../lib/ui'
import { getAuthErrorMessage, redirectToLocalhostForGoogleAuth } from '../lib/authDomain'

/* ─────────────────────────  Firebase error map  ───────────────── */
const ERROR_MAP = {
  'auth/user-not-found': 'No account found with this email address.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
  'auth/invalid-credential': 'Invalid email or password. Please check and try again.',
  'auth/network-request-failed': 'Network error. Please check your connection.',
  'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
  'auth/invalid-phone-number': 'Invalid phone number. Use E.164 format (e.g. +91xxxxxxxxxx).',
  'auth/code-expired': 'Verification code expired. Please request a new one.',
  'auth/invalid-verification-code': 'Invalid code. Please check and try again.',
}

function getError(err) {
  return getAuthErrorMessage(err) || ERROR_MAP[err.code] || err.message || 'An unexpected error occurred.'
}

/* ─────────────────────────  Floating Input  ───────────────────── */
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
          <Icon
            className={cn(
              'mr-3 h-[18px] w-[18px] shrink-0 transition-colors duration-200',
              focused ? 'text-emerald-500' : error ? 'text-red-400' : 'text-slate-400 dark:text-slate-500',
            )}
          />
        )}

        <div className="relative flex-1 h-full flex items-center">
          <input
            id={id}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder=" "
            className="
              peer
              block w-full bg-transparent pt-3 pb-0
              text-[13px] font-semibold text-slate-900
              placeholder-transparent
              focus:outline-none focus:ring-0
              dark:text-white
            "
            {...rest}
          />
          <label
            htmlFor={id}
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
          <motion.p
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            className="mt-1 pl-1 text-[11px] font-semibold text-red-500"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─────────────────────────  Submit Button  ─────────────────────── */
function SubmitButton({ loading, children, id, ...rest }) {
  return (
    <button
      id={id}
      type="submit"
      disabled={loading}
      className="
        group relative flex h-12 w-full items-center justify-center gap-2
        rounded-xl
        bg-gradient-to-r from-emerald-600 to-green-700
        text-[11px] font-extrabold uppercase tracking-[0.12em] text-white
        shadow-lg shadow-emerald-700/20
        transition-all duration-300
        hover:-translate-y-[1px] hover:shadow-xl hover:shadow-emerald-600/25
        active:translate-y-0
        disabled:opacity-55 disabled:pointer-events-none
      "
      {...rest}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      ) : (
        children
      )}
    </button>
  )
}

/* ─────────────────────────  Error Alert  ───────────────────────── */
function ErrorAlert({ message }) {
  if (!message) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200/70 bg-red-50/60 p-3.5 dark:border-red-500/10 dark:bg-red-500/5"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
      <p className="text-[12px] font-semibold leading-relaxed text-red-700 dark:text-red-200">{message}</p>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   LOGIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function LoginPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  /* view mode: 'email' | 'phone' | 'forgot' */
  const [mode, setMode] = useState('email')

  /* form state */
  const [form, setForm] = useState({ email: '', password: '' })
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState(null)

  /* UI state */
  const [errors, setErrors] = useState({})
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [remember, setRemember] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [timer, setTimer] = useState(0)

  /* redirect if already logged in */
  if (user) return <Navigate to="/dashboard" replace />

  /* OTP countdown */
  useEffect(() => {
    if (!otpSent || timer <= 0) return
    const id = setInterval(() => setTimer((t) => t - 1), 1000)
    return () => clearInterval(id)
  }, [otpSent, timer])

  /* cleanup recaptcha on unmount */
  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear() } catch { /* noop */ }
        window.recaptchaVerifier = null
      }
    }
  }, [])

  /* ─── handlers ─── */
  const set = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }))
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }))
  }

  const handleGoogleLogin = async () => {
    if (redirectToLocalhostForGoogleAuth()) return
    setLoading(true); setErrors({})
    try {
      await signInWithPopup(auth, googleProvider)
      navigate('/dashboard')
    } catch (err) {
      setErrors({ general: getError(err) })
    } finally { setLoading(false) }
  }

  /* email login */
  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.password) errs.password = 'Password is required'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true); setErrors({})
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setErrors({ general: getError(err) })
    } finally { setLoading(false) }
  }

  /* phone: setup recaptcha */
  const setupRecaptcha = (containerId = 'recaptcha-container') => {
    if (window.recaptchaVerifier) {
      try { window.recaptchaVerifier.clear() } catch { /* noop */ }
    }
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {},
      'expired-callback': () => setErrors({ general: 'Verification expired. Try again.' }),
    })
  }

  /* phone: send OTP */
  const handleSendOTP = async (e) => {
    e.preventDefault()
    if (!phoneNumber.trim()) { setErrors({ phone: 'Phone number is required' }); return }
    const clean = phoneNumber.replace(/[\s()-]/g, '')
    if (!/^\+[1-9]\d{1,14}$/.test(clean)) {
      setErrors({ phone: 'Use E.164 format (e.g. +91xxxxxxxxxx)' }); return
    }
    setLoading(true); setErrors({})
    try {
      setupRecaptcha()
      const result = await signInWithPhoneNumber(auth, clean, window.recaptchaVerifier)
      setConfirmationResult(result); setOtpSent(true); setTimer(60)
    } catch (err) {
      setErrors({ general: getError(err) })
      if (window.recaptchaVerifier) { try { window.recaptchaVerifier.clear() } catch {} }
      window.recaptchaVerifier = null
    } finally { setLoading(false) }
  }

  /* phone: verify OTP */
  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    if (!otpCode || otpCode.length < 6) { setErrors({ otp: 'Enter the 6-digit code' }); return }
    setLoading(true); setErrors({})
    try {
      await confirmationResult.confirm(otpCode)
      navigate('/dashboard')
    } catch (err) {
      setErrors({ otp: getError(err) })
    } finally { setLoading(false) }
  }

  /* phone: resend */
  const handleResendOTP = async () => {
    if (timer > 0) return
    setLoading(true); setErrors({})
    try {
      setupRecaptcha()
      const clean = phoneNumber.replace(/[\s()-]/g, '')
      const result = await signInWithPhoneNumber(auth, clean, window.recaptchaVerifier)
      setConfirmationResult(result); setTimer(60)
    } catch (err) { setErrors({ general: getError(err) }) }
    finally { setLoading(false) }
  }

  /* forgot password */
  const handleForgotSubmit = async (e) => {
    e.preventDefault()
    if (!form.email.trim()) { setErrors({ email: 'Email is required' }); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setErrors({ email: 'Enter a valid email' }); return }
    setLoading(true); setErrors({})
    try {
      await sendPasswordResetEmail(auth, form.email)
      setResetSent(true)
    } catch (err) { setErrors({ general: getError(err) }) }
    finally { setLoading(false) }
  }

  /* ─── slide animation props ─── */
  const slideIn  = { initial: { opacity: 0, x: -12 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 12 }, transition: { duration: 0.22 } }
  const slideOut = { initial: { opacity: 0, x: 12 },  animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -12 }, transition: { duration: 0.22 } }

  /* ─── render ─── */
  return (
    <AuthShell
      eyebrow="Smart Agriculture Command Center"
      title="Operate every flock"
      highlight="with AI clarity."
      description="Track flock health, growth curves, feed utilisation, and vaccination risk — a dashboard built for modern poultry teams."
      stats={[
        { value: '2.5K+', label: 'Farms Connected' },
        { value: '1.2M', label: 'Birds Monitored' },
        { value: '94%', label: 'AI Accuracy' },
      ]}
    >
      {/* invisible recaptcha anchor */}
      <div id="recaptcha-container" />

      {/* ── FORGOT PASSWORD VIEW ────────────────────────────── */}
      {mode === 'forgot' ? (
        <div>
          <button
            type="button"
            onClick={() => { setMode('email'); setErrors({}); setResetSent(false) }}
            className="mb-5 inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 transition hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to login
          </button>

          <h2 className="font-heading text-xl font-black text-slate-900 dark:text-white">Reset password</h2>
          <p className="mt-1 mb-6 text-[12px] leading-5 text-slate-500 dark:text-slate-400">
            We'll email you a secure link to reset your password.
          </p>

          <ErrorAlert message={errors.general} />

          {resetSent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5 text-center dark:border-emerald-500/10 dark:bg-emerald-500/5"
            >
              <div className="mx-auto mb-2 grid h-9 w-9 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-500/20">
                <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
              </div>
              <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Link Sent!</p>
              <p className="mt-1 text-[11px] text-emerald-700/70 dark:text-emerald-400/70">
                Check <span className="font-bold">{form.email}</span>
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleForgotSubmit}>
              <FloatingInput id="reset-email" name="email" type="email" label="Email address" icon={Mail} value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} required />
              <SubmitButton loading={loading}>
                Send recovery link <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </SubmitButton>
            </form>
          )}
        </div>
      ) : (
        /* ── MAIN LOGIN VIEW ────────────────────────────────── */
        <div>
          {/* header */}
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">Welcome back</p>
          <h2 className="mt-1 font-heading text-[22px] font-black text-slate-900 dark:text-white">
            Sign in to <span className="text-emerald-600 dark:text-emerald-400">Poultry</span><span className="text-amber-500 dark:text-amber-400">Pro</span>
          </h2>
          <p className="mt-1 mb-5 text-[12px] text-slate-500 dark:text-slate-400">Access your AI farm control center.</p>

          {/* tabs */}
          <div className="mb-5 flex rounded-xl bg-slate-100/80 p-1 dark:bg-white/[0.04]">
            {[
              { key: 'email', label: 'Email Login' },
              { key: 'phone', label: 'Phone (OTP)' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => { setMode(tab.key); setErrors({}) }}
                className={cn(
                  'flex-1 rounded-lg py-2 text-[11px] font-extrabold transition-all duration-200',
                  mode === tab.key
                    ? 'bg-white text-emerald-700 shadow-sm dark:bg-white/[0.09] dark:text-white'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <ErrorAlert message={errors.general} />

          {/* tab body */}
          <AnimatePresence mode="wait">
            {mode === 'email' ? (
              /* ── EMAIL FORM ─── */
              <motion.form key="email" {...slideIn} onSubmit={handleEmailSubmit}>
                <FloatingInput id="email" name="email" type="email" label="Email address" icon={Mail} value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} required autoComplete="email" />

                <FloatingInput
                  id="password" name="password" type={showPw ? 'text' : 'password'} label="Password" icon={LockKeyhole}
                  value={form.password} onChange={(e) => set('password', e.target.value)} error={errors.password} required autoComplete="current-password"
                  rightSlot={
                    <button type="button" tabIndex={-1} onClick={() => setShowPw((v) => !v)}
                      className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-white"
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                />

                {/* remember + forgot */}
                <div className="mb-5 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-white/10 dark:bg-white/5"
                    />
                    Remember me
                  </label>
                  <button type="button" onClick={() => { setMode('forgot'); setErrors({}) }}
                    className="text-[11px] font-bold text-emerald-600 transition hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                  >
                    Forgot password?
                  </button>
                </div>

                <SubmitButton id="login-submit-btn" loading={loading}>
                  Sign in to dashboard <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </SubmitButton>
              </motion.form>
            ) : (
              /* ── PHONE FORM ─── */
              <motion.form key="phone" {...slideOut} onSubmit={otpSent ? handleVerifyOTP : handleSendOTP}>
                {!otpSent ? (
                  <>
                    <FloatingInput id="phone" name="phone" type="tel" label="Phone number (+country code)" icon={Phone}
                      value={phoneNumber} onChange={(e) => { setPhoneNumber(e.target.value); if (errors.phone) setErrors((x) => ({ ...x, phone: '' })) }}
                      error={errors.phone} required autoComplete="tel"
                    />
                    <p className="mb-4 text-[10px] text-slate-400 dark:text-slate-500">
                      E.164 format — e.g. <span className="font-bold text-slate-500 dark:text-slate-400">+91 98765 43210</span>
                    </p>
                    <SubmitButton id="send-otp-btn" loading={loading}>
                      Send verification code <Smartphone className="h-3.5 w-3.5 text-emerald-200" />
                    </SubmitButton>
                  </>
                ) : (
                  <>
                    {/* sent-to banner */}
                    <div className="mb-4 flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 dark:border-emerald-500/10 dark:bg-emerald-500/5">
                      <div>
                        <p className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Code sent to</p>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-300">{phoneNumber}</p>
                      </div>
                      <button type="button" onClick={() => { setOtpSent(false); setOtpCode(''); setErrors({}) }}
                        className="text-[10px] font-bold text-emerald-700 hover:underline dark:text-emerald-300"
                      >
                        Change
                      </button>
                    </div>

                    <FloatingInput id="otp" name="otp" type="text" label="6-digit verification code" icon={Fingerprint}
                      value={otpCode} onChange={(e) => { setOtpCode(e.target.value); if (errors.otp) setErrors((x) => ({ ...x, otp: '' })) }}
                      error={errors.otp} maxLength={6} required autoComplete="one-time-code"
                    />

                    <div className="mb-4 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 dark:text-slate-500">Didn't get the code?</span>
                      {timer > 0 ? (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">Resend in {timer}s</span>
                      ) : (
                        <button id="resend-otp-btn" type="button" onClick={handleResendOTP} disabled={loading}
                          className="inline-flex items-center gap-1 font-bold text-emerald-600 hover:text-emerald-700 hover:underline dark:text-emerald-400"
                        >
                          <RotateCcw className="h-3 w-3" /> Resend
                        </button>
                      )}
                    </div>

                    <SubmitButton id="verify-otp-btn" loading={loading}>
                      Verify &amp; Sign in <Check className="h-3.5 w-3.5 text-emerald-200" />
                    </SubmitButton>
                  </>
                )}
              </motion.form>
            )}
          </AnimatePresence>

          {/* divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-white/[0.07]" />
            <span className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">Or continue with</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-white/[0.07]" />
          </div>

          {/* Google button */}
          <button
            id="google-login-btn"
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="
              group flex h-12 w-full items-center justify-center gap-3
              rounded-xl border border-slate-200 bg-white
              text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-700
              shadow-sm transition-all duration-300
              hover:-translate-y-[1px] hover:border-emerald-200 hover:shadow-md hover:text-emerald-700
              disabled:opacity-55 disabled:pointer-events-none
              dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-200
              dark:hover:bg-white/[0.06] dark:hover:text-white
            "
          >
            <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-[11px] font-black text-blue-600 shadow-sm ring-1 ring-slate-100 dark:ring-white/10">G</span>
            Sign in with Google
          </button>

          {/* footer */}
          <p className="mt-7 border-t border-slate-100 pt-5 text-center text-[12px] text-slate-500 dark:border-white/[0.06] dark:text-slate-400">
            New to PoultryPro?{' '}
            <Link
              id="signup-link"
              to="/signup"
              className="font-bold text-emerald-600 underline decoration-emerald-500/30 underline-offset-[3px] transition hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              Create an account
            </Link>
          </p>
        </div>
      )}
    </AuthShell>
  )
}
