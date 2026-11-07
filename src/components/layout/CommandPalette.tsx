import { Command } from 'cmdk'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Search, KanbanSquare, CalendarDays, FolderOpen,
  PenLine, Wallet, BarChart3, BookOpen, Settings, Sun, Moon, Monitor,
  Upload, Plus,
} from 'lucide-react'
import { useUIStore } from '@/store/useUIStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useProfileStore } from '@/store/useProfileStore'
import { SCHOLARSHIPS } from '@/data/scholarships'
import { useHotkeys } from '@/hooks/useHotkeys'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const PAGES = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/discover', label: 'Discover Scholarships', icon: Search },
  { to: '/app/tracker', label: 'Application Tracker', icon: KanbanSquare },
  { to: '/app/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/app/documents', label: 'Document Vault', icon: FolderOpen },
  { to: '/app/essays', label: 'Essay Studio', icon: PenLine },
  { to: '/app/planner', label: 'Funding Planner', icon: Wallet },
  { to: '/app/insights', label: 'Insights', icon: BarChart3 },
  { to: '/app/learn', label: 'Learn', icon: BookOpen },
  { to: '/app/settings', label: 'Settings', icon: Settings },
]

export function CommandPalette() {
  const open = useUIStore((s) => s.commandOpen)
  const setOpen = useUIStore((s) => s.setCommandOpen)
  const navigate = useNavigate()
  const setTheme = useSettingsStore((s) => s.setTheme)
  const hasProfile = useProfileStore((s) => !!s.profile)

  useHotkeys('mod+k', () => setOpen(!open), { preventDefault: true })

  function go(to) {
    navigate(to)
    setOpen(false)
  }

  function runAction(action) {
    switch (action) {
      case 'theme-light': setTheme('light'); toast.success('Light mode'); break
      case 'theme-dark': setTheme('dark'); toast.success('Dark mode'); break
      case 'theme-system': setTheme('system'); toast.success('System theme'); break
      case 'new-essay': navigate('/app/essays'); break
      case 'upload-doc': navigate('/app/documents'); break
      case 'export-data': navigate('/app/settings'); break
    }
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh]" role="dialog" aria-modal>
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div className="relative z-10 w-full max-w-xl rounded-lg border border-border bg-surface shadow-lift md:mx-4">
        <Command
          className="overflow-hidden rounded-lg"
          label="Command Palette"
        >
          <div className="flex items-center gap-2 border-b border-border px-4">
            <Search className="h-4 w-4 text-ink-subtle" />
            <Command.Input
              autoFocus
              placeholder="Search or run a command…"
              className="h-12 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-subtle/60 focus-visible:outline-none"
            />
            <kbd className="rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-ink-muted">ESC</kbd>
          </div>
          <Command.List className="max-h-[50vh] overflow-y-auto p-2">
            <Command.Empty className="px-3 py-6 text-center text-sm text-ink-muted">
              No results found.
            </Command.Empty>

            {hasProfile && (
              <Command.Group heading="Navigate" className="px-2">
                {PAGES.map((p) => (
                  <Command.Item
                    key={p.to}
                    onSelect={() => go(p.to)}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm text-ink',
                      'cursor-pointer aria-selected:bg-surface-2',
                    )}
                  >
                    <p.icon className="h-4 w-4 text-ink-muted" />
                    {p.label}
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            <Command.Group heading="Search Scholarships" className="px-2">
              {SCHOLARSHIPS.slice(0, 6).map((s) => (
                <Command.Item
                  key={s.id}
                  onSelect={() => go(`/app/scholarship/${s.slug}`)}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm text-ink',
                    'cursor-pointer aria-selected:bg-surface-2',
                  )}
                >
                  <Search className="h-4 w-4 text-ink-muted" />
                  <span className="flex-1 truncate">{s.name}</span>
                  <span className="text-xs text-ink-subtle">{s.provider}</span>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Actions" className="px-2">
              <Command.Item onSelect={() => runAction('theme-light')} className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm aria-selected:bg-surface-2">
                <Sun className="h-4 w-4 text-ink-muted" /> Light mode
              </Command.Item>
              <Command.Item onSelect={() => runAction('theme-dark')} className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm aria-selected:bg-surface-2">
                <Moon className="h-4 w-4 text-ink-muted" /> Dark mode
              </Command.Item>
              <Command.Item onSelect={() => runAction('theme-system')} className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm aria-selected:bg-surface-2">
                <Monitor className="h-4 w-4 text-ink-muted" /> System theme
              </Command.Item>
              {hasProfile && (
                <>
                  <Command.Item onSelect={() => runAction('new-essay')} className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm aria-selected:bg-surface-2">
                    <Plus className="h-4 w-4 text-ink-muted" /> New essay
                  </Command.Item>
                  <Command.Item onSelect={() => runAction('upload-doc')} className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm aria-selected:bg-surface-2">
                    <Upload className="h-4 w-4 text-ink-muted" /> Upload document
                  </Command.Item>
                </>
              )}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  )
}
