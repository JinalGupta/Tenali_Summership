import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import OTPInput from '../components/OTPInput'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { email, name, step, loading, error, success, user,
    setEmail, setName, setStep, setError,
    sendOTP, verifyOTP, logout, fetchMe } = useAuthStore()

  const [cooldown, setCooldown] = useState(0)
  const [otpValue, setOtpValue] = useState('')

  // Check if already logged in
  useEffect(() => { fetchMe() }, [])
  useEffect(() => { if (user) navigate('/dashboard') }, [user])

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000)
    return () => clearInterval(id)
  }, [cooldown])

  const handleSendOTP = async () => {
    setError('')
    if (!name.trim()) { setError('Please enter your full name'); return }
    const ok = await sendOTP()
    if (ok) setCooldown(30)
  }

  const handleOTPComplete = async (token) => {
    const ok = await verifyOTP(token)
    if (ok) {
      // redirect to dashboard via useEffect watching user
    }
  }

  const handleResend = async () => {
    if (cooldown > 0) return
    setOtpValue('')
    const ok = await sendOTP()
    if (ok) setCooldown(30)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="font-display text-3xl text-navy mb-2">Welcome, {name}!</h2>
          <p className="text-muted mb-6">Your account is ready. Redirecting to dashboard…</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-teal/10 blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-amber/10 blur-3xl translate-x-1/4 translate-y-1/4" />
        <span className="inline-block px-3 py-1 bg-teal/20 text-teal text-xs font-semibold rounded-full tracking-wide z-10">EDUCATIONAL DESIGN LAB</span>
        <div className="relative z-10">
          <h1 className="font-display text-6xl text-white font-bold leading-tight">Tenali</h1>
          <p className="text-teal text-xl mt-2">Learn Through Wonder</p>
          <div className="w-16 h-1 bg-teal mt-6 rounded-full" />
          <p className="text-white/60 mt-6 text-lg leading-relaxed">Start your journey through mathematical theorems — one question at a time.</p>
        </div>
        <p className="text-white/30 text-sm relative z-10">© 2026 Educational Design Lab</p>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${step === 'email' ? 'bg-teal text-white' : 'bg-teal text-white'}`}>1</div>
            <div className={`flex-1 h-1 rounded-full transition-colors ${step === 'otp' ? 'bg-teal' : 'bg-gray-200'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${step === 'otp' ? 'bg-navy text-white' : 'bg-gray-200 text-muted'}`}>2</div>
          </div>

          <AnimatePresence mode="wait">
            {step === 'email' ? (
              <motion.div key="email" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <h2 className="font-display text-3xl text-navy mb-1">Create your account</h2>
                <p className="text-muted mb-8">Enter your details to get started.</p>

                <label className="block text-sm font-semibold text-navy mb-2">Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Priya Sharma" autoComplete="name"
                  className="input-field mb-4" />

                <label className="block text-sm font-semibold text-navy mb-2">Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="priya@example.com" autoComplete="email"
                  className="input-field mb-4"
                  onKeyDown={(e) => e.key === 'Enter' && !loading && handleSendOTP()} />

                {error && (
                  <p className="text-coral text-sm mb-4 flex items-center gap-1">
                    <span>⚠</span> {error}
                  </p>
                )}

                <button onClick={handleSendOTP} disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading ? (
                    <span className="animate-pulse">Sending code…</span>
                  ) : 'Continue'}
                </button>

                <p className="text-center text-muted text-sm mt-6">
                  Already have an account?{' '}
                  <Link to="/login" className="text-teal font-semibold hover:underline">Log in</Link>
                </p>
              </motion.div>
            ) : (
              <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                <h2 className="font-display text-3xl text-navy mb-1">Check your email</h2>
                <p className="text-muted mb-8">We sent a 6-digit code to <span className="font-semibold text-navy">{email}</span></p>

                <div className="mb-6">
                  <OTPInput value={otpValue} onChange={setOtpValue}
                    onComplete={handleOTPComplete} error={!!error} />
                </div>

                {error && (
                  <p className="text-coral text-sm mb-4 flex items-center gap-1">
                    <span>⚠</span> {error}
                  </p>
                )}

                {loading && (
                  <p className="text-teal text-sm text-center mb-4 animate-pulse">Verifying…</p>
                )}

                <button onClick={handleResend} disabled={cooldown > 0 || loading}
                  className={`w-full py-3 rounded-btn font-semibold text-sm transition-all ${cooldown > 0 ? 'bg-gray-100 text-muted cursor-not-allowed' : 'bg-navy/10 text-navy hover:bg-navy hover:text-white'}`}>
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
                </button>

                <button onClick={() => { setStep('email'); setOtpValue('') }} disabled={loading}
                  className="w-full mt-3 text-sm text-muted hover:text-navy transition-colors">
                  ← Change email address
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}