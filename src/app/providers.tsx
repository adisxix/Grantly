import { useEffect } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from 'sonner'
import { useSettingsStore } from '@/store/useSettingsStore'

/**
 * Applies theme/text-size/motion settings to the document root and
 * wraps children with global providers (tooltips, toasts).
 */
export function Providers({ children }) {
  const theme = useSettingsStore((s) => s.theme)
  const textSize = useSettingsStore((s) => s.textSize)
  const reduceMotion = useSettingsStore((s) => s.reduceMotion)
  const highContrast = useSettingsStore((s) => s.highContrast)

  useEffect(() => {
    const root = document.documentElement
    const apply = () => {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const isDark = theme === 'dark' || (theme === 'system' && systemDark)
      root.classList.toggle('dark', isDark)
    }
    apply()
    if (theme === 'system') {
      const mql = window.matchMedia('(prefers-color-scheme: dark)')
      mql.addEventListener('change', apply)
      return () => mql.removeEventListener('change', apply)
    }
  }, [theme])

  useEffect(() => {
    document.documentElement.classList.remove('text-size-sm', 'text-size-md', 'text-size-lg')
    document.documentElement.classList.add(`text-size-${textSize}`)
  }, [textSize])

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reduceMotion)
  }, [reduceMotion])

  useEffect(() => {
    document.documentElement.classList.toggle('contrast-high', highContrast)
  }, [highContrast])

  return (
    <TooltipProvider delayDuration={200}>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'rounded-md border border-border bg-surface text-ink shadow-soft',
        }}
      />
    </TooltipProvider>
  )
}
