import { useEffect } from 'react'

/**
 * Register a global hotkey. Keys are lowercase.
 * @param {string|string[]} keys - e.g. 'mod+k', '/', 'g d'
 * @param {(e: KeyboardEvent) => void} handler
 * @param {{ preventDefault?: boolean, enabled?: boolean }} [options]
 */
export function useHotkeys(keys, handler, options = {}) {
  const { preventDefault = true, enabled = true } = options
  useEffect(() => {
    if (!enabled) return
    const keyList = Array.isArray(keys) ? keys : [keys]
    function onKeyDown(e) {
      const mod = e.metaKey || e.ctrlKey
      for (const combo of keyList) {
        const parts = combo.toLowerCase().split('+').map((p) => p.trim())
        const needsMod = parts.includes('mod')
        const needsShift = parts.includes('shift')
        const needsAlt = parts.includes('alt')
        const actualKey = parts.filter((p) => !['mod', 'shift', 'alt'].includes(p))[0] || ''
        if (
          (needsMod ? mod : true) &&
          (needsShift ? e.shiftKey : true) &&
          (needsAlt ? e.altKey : true) &&
          e.key.toLowerCase() === actualKey
        ) {
          if (preventDefault) e.preventDefault()
          handler(e)
          return
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [keys, handler, preventDefault, enabled])
}
