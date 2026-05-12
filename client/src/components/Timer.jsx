import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'

export default function Timer({ seconds, onDone, className = '' }) {
  useEffect(() => {
    if (seconds <= 0) { onDone?.(); return }
    const id = setInterval(() => onDone?.(), seconds * 1000)
    return () => clearInterval(id)
  }, [seconds])

  if (seconds <= 0) return null
  return (
    <span className={`font-mono text-sm text-muted ${className}`}>
      Resend in {seconds}s
    </span>
  )
}