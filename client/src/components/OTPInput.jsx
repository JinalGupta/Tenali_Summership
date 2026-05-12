import { useRef, useState } from 'react'

export default function OTPInput({ length = 6, value, onChange, onComplete, error = false }) {
  const refs = useRef([])
  const [focused, setFocused] = useState(-1)

  const digits = value.padEnd(length, '').slice(0, length).split('')

  const handleChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return
    const newVal = value.slice(0, idx) + val + value.slice(idx + 1)
    onChange(newVal)
    if (val && idx < length - 1) refs.current[idx + 1]?.focus()
    if (newVal.length === length) onComplete?.(newVal)
  }

  const handleKey = (idx, e) => {
    if (e.key === 'Backspace') {
      if (value[idx] || idx > 0) {
        const newVal = value.slice(0, idx - 1) + value.slice(idx)
        onChange(newVal)
        refs.current[Math.max(0, idx - 1)]?.focus()
      }
      e.preventDefault()
    }
    if (e.key === 'ArrowLeft') refs.current[Math.max(0, idx - 1)]?.focus()
    if (e.key === 'ArrowRight') refs.current[Math.min(length - 1, idx + 1)]?.focus()
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    onChange(pasted)
    if (pasted.length === length) onComplete?.(pasted)
    refs.current[Math.min(pasted.length, length - 1)]?.focus()
  }

  return (
    <div className="flex gap-2 justify-center" role="group" aria-label="OTP input">
      {digits.map((d, idx) => (
        <input
          key={idx}
          ref={(el) => (refs.current[idx] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKey(idx, e)}
          onPaste={idx === 0 ? handlePaste : undefined}
          onFocus={() => setFocused(idx)}
          onBlur={() => setFocused(-1)}
          aria-label={`Digit ${idx + 1} of ${length}`}
          className={`
            w-12 h-14 text-center text-2xl font-mono font-semibold
            border-2 rounded-input transition-all duration-200
            focus:outline-none select-none
            ${error
              ? 'border-coral bg-coral/5 text-coral'
              : focused === idx
                ? 'border-teal bg-teal/5 text-navy'
                : d
                  ? 'border-teal/60 bg-white text-navy'
                  : 'border-gray-200 bg-white text-navy'
            }
          `}
        />
      ))}
    </div>
  )
}