import { create } from 'zustand'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('tenali_token') || null,
  loading: false,
  error: '',
  step: 'email',  // 'email' | 'otp'
  email: '',
  name: '',
  isRegister: false,
  otpCooldown: 0,
  success: false,

  setEmail: (email) => set({ email, error: '' }),
  setName: (name) => set({ name }),
  setStep: (step) => set({ step, error: '' }),
  setError: (error) => set({ error }),

  // Send OTP — calls real backend
  sendOTP: async () => {
    const { email, name, isRegister } = get()
    if (!email.trim() || !email.includes('@')) {
      set({ error: 'Please enter a valid email address' })
      return false
    }
    set({ loading: true, error: '' })
    try {
      await axios.post(`${API}/auth/request-otp`, {
        email: email.trim(),
        name: name.trim(),
        isRegister,
      })
      set({ step: 'otp', loading: false })
      return true
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to send OTP. Please try again.'
      set({ error: msg, loading: false })
      return false
    }
  },

  // Verify OTP — calls real backend
  verifyOTP: async (token) => {
    const { email } = get()
    set({ loading: true, error: '' })
    try {
      const res = await axios.post(`${API}/auth/verify-otp`, { email, token })
      const { token: jwt, user } = res.data
      localStorage.setItem('tenali_token', jwt)
      set({ token: jwt, user, loading: false, success: true })
      return true
    } catch (err) {
      const msg = err.response?.data?.error || 'Invalid code. Please try again.'
      set({ error: msg, loading: false })
      return false
    }
  },

  // Load current user from token
  fetchMe: async () => {
    const { token } = get()
    if (!token) return
    try {
      const res = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      set({ user: res.data })
    } catch {
      localStorage.removeItem('tenali_token')
      set({ token: null, user: null })
    }
  },

  logout: () => {
    localStorage.removeItem('tenali_token')
    set({ user: null, token: null, step: 'email', email: '', name: '', success: false })
  },
}))