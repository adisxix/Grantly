import { useEffect, useState } from 'react'
import { useSettingsStore } from '@/store/useSettingsStore'

/**
 * Returns true if motion should be reduced (system preference or user setting).
 * @returns {boolean}
 */
export function useReducedMotion() {
  const reduceMotion = useSettingsStore((s) => s.reduceMotion)
  const [systemReduced, setSystemReduced] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  )
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = (e) => setSystemReduced(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])
  return reduceMotion || systemReduced
}
