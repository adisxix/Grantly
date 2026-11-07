import { useEffect, useState } from 'react'

/**
 * Live countdown to a target date.
 * @param {string|Date} target
 * @returns {{ days: number, hours: number, minutes: number, seconds: number, total: number, isPast: boolean }}
 */
export function useCountdown(target) {
  const targetTime = new Date(target).getTime()
  const compute = () => {
    const total = targetTime - Date.now()
    const isPast = total < 0
    const abs = Math.abs(total)
    return {
      total,
      isPast,
      days: Math.floor(abs / (1000 * 60 * 60 * 24)),
      hours: Math.floor((abs / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((abs / (1000 * 60)) % 60),
      seconds: Math.floor((abs / 1000) % 60),
    }
  }
  const [value, setValue] = useState(compute)
  useEffect(() => {
    const t = setInterval(() => setValue(compute()), 1000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetTime])
  return value
}
