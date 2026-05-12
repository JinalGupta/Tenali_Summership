import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  step: 'email',     // 'email' | 'otp'
  email: '',
  name: '',
  isRegister: false,
  otpSent: false,
  otpCooldown: 0,
  error: '',
  success: false,

  setEmail: (email) => set({ email, error: '' }),
  setName: (name) => set({ name }),
  setRegister: (isRegister) => set({ isRegister, step: 'email', error: '' }),
  setStep: (step) => set({ step, error: '' }),
  setOtpSent: (otpSent) => set({ otpSent }),
  setOtpCooldown: (otpCooldown) => set({ otpCooldown }),
  setError: (error) => set({ error }),
  setSuccess: (success) => set({ success }),

  reset: () => set({
    step: 'email', email: '', name: '', isRegister: false,
    otpSent: false, otpCooldown: 0, error: '', success: false
  }),
}))