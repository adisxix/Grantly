import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { MobileNav } from '@/components/layout/MobileNav'
import { CommandPalette } from '@/components/layout/CommandPalette'
import { ErrorBoundary } from '@/components/layout/ErrorBoundary'
import { useUIStore } from '@/store/useUIStore'
import { scanDeadlineNotifications } from '@/features/notifications/scanner'
import { cn } from '@/lib/utils'

const ROUTE_TITLES = {
  '/app/dashboard': 'Dashboard',
  '/app/discover': 'Discover',
  '/app/tracker': 'Tracker',
  '/app/calendar': 'Calendar',
  '/app/documents': 'Documents',
  '/app/essays': 'Essay Studio',
  '/app/planner': 'Funding Planner',
  '/app/insights': 'Insights',
  '/app/learn': 'Learn',
  '/app/settings': 'Settings',
}

export function AppShell() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const location = useLocation()
  const navigate = useNavigate()

  // Set document title per route
  useEffect(() => {
    const base = ROUTE_TITLES[location.pathname]
    if (base) document.title = `${base} · Grantly`
    else if (location.pathname.includes('/scholarship/')) document.title = 'Scholarship · Grantly'
    else if (location.pathname.includes('/essays/')) document.title = 'Essay Editor · Grantly'
    else if (location.pathname.includes('/learn/')) document.title = 'Learn · Grantly'
    else document.title = 'Grantly — Find it. Fit it. Fund it.'
  }, [location.pathname])

  // Scan for deadline notifications on mount
  useEffect(() => {
    const t = setTimeout(() => scanDeadlineNotifications(), 1500)
    return () => clearTimeout(t)
  }, [])

  // g-prefix navigation hotkeys (g d/s/t/c)
  const gPressedRef = useRef(false)
  useEffect(() => {
    function onKey(e) {
      const tag = e.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) return
      if (e.key === 'g') {
        gPressedRef.current = true
        setTimeout(() => { gPressedRef.current = false }, 800)
        return
      }
      if (gPressedRef.current) {
        gPressedRef.current = false
        const map = { d: '/app/dashboard', s: '/app/discover', t: '/app/tracker', c: '/app/calendar' }
        const dest = map[e.key.toLowerCase()]
        if (dest) { e.preventDefault(); navigate(dest) }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate])

  return (
    <div className="flex min-h-screen bg-paper">
      <a href="#main" className="skip-link">Skip to content</a>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden md:flex shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-200',
          collapsed ? 'w-[72px]' : 'w-[264px]',
        )}
      >
        <Sidebar />
      </aside>

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main id="main" className="flex-1 px-4 py-6 md:px-6 lg:px-8 pb-24 md:pb-6">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
      {/* Command palette */}
      <CommandPalette />
    </div>
  )
}
