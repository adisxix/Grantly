import { useNavigate, useLocation } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useUIStore } from '@/store/useUIStore'
import { NotificationBell } from '@/components/layout/NotificationBell'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { Avatar } from '@/components/ui/avatar'
import { useProfileStore } from '@/store/useProfileStore'

const TITLES = {
  '/app/dashboard': 'Dashboard',
  '/app/discover': 'Discover Scholarships',
  '/app/tracker': 'Application Tracker',
  '/app/calendar': 'Calendar',
  '/app/documents': 'Document Vault',
  '/app/essays': 'Essay Studio',
  '/app/planner': 'Funding Planner',
  '/app/insights': 'Insights',
  '/app/learn': 'Learn',
  '/app/settings': 'Settings',
}

export function Topbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const setCommandOpen = useUIStore((s) => s.setCommandOpen)
  const profile = useProfileStore((s) => s.profile)

  const title = TITLES[location.pathname] || (location.pathname.includes('/scholarship/') ? 'Scholarship Details' : location.pathname.includes('/essays/') ? 'Essay Editor' : location.pathname.includes('/learn/') ? 'Learn' : 'Grantly')

  return (
    <header className="sticky top-0 z-40 glass border-b border-border">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-lg font-semibold text-ink md:text-xl">{title}</h1>
        </div>

        {/* Search trigger */}
        <button
          onClick={() => setCommandOpen(true)}
          className="hidden items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink-subtle hover:bg-surface-2 md:flex"
          aria-label="Open command palette"
        >
          <Search className="h-4 w-4" />
          <span className="text-xs">Search…</span>
          <kbd className="ml-4 rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
        </button>

        <div className="flex items-center gap-1">
          {/* Mobile search */}
          <button
            onClick={() => setCommandOpen(true)}
            className="rounded-md p-2 text-ink-muted hover:bg-surface-2 hover:text-ink md:hidden"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          <NotificationBell />
          <ThemeToggle />
          <button
            onClick={() => navigate('/app/settings')}
            className="ml-1 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-1"
            aria-label="Account"
          >
            <Avatar name={profile?.fullName || 'Guest'} size={36} />
          </button>
        </div>
      </div>
    </header>
  )
}
