import { Sun, Moon, Monitor } from 'lucide-react'
import { useSettingsStore } from '@/store/useSettingsStore'

const OPTIONS = [
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'dark', icon: Moon, label: 'Dark' },
  { value: 'system', icon: Monitor, label: 'System' },
]

export function ThemeToggle() {
  const theme = useSettingsStore((s) => s.theme)
  const setTheme = useSettingsStore((s) => s.setTheme)
  const current = OPTIONS.find((o) => o.value === theme) || OPTIONS[2]
  const CurrentIcon = current.icon

  function cycle() {
    const idx = OPTIONS.findIndex((o) => o.value === theme)
    setTheme(OPTIONS[(idx + 1) % OPTIONS.length].value)
  }

  return (
    <button
      onClick={cycle}
      className="rounded-md p-2 text-ink-muted hover:bg-surface-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-1"
      aria-label={`Theme: ${current.label}. Click to switch.`}
      title={`Theme: ${current.label}`}
    >
      <CurrentIcon className="h-5 w-5" />
    </button>
  )
}
