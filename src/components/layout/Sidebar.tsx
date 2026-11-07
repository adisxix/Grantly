import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Search, KanbanSquare, CalendarDays, FolderOpen,
  PenLine, Wallet, BarChart3, BookOpen, Settings, GraduationCap,
  PanelLeftClose, PanelLeft,
} from 'lucide-react'
import { useUIStore } from '@/store/useUIStore'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/discover', label: 'Discover', icon: Search },
  { to: '/app/tracker', label: 'Tracker', icon: KanbanSquare },
  { to: '/app/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/app/documents', label: 'Documents', icon: FolderOpen },
  { to: '/app/essays', label: 'Essay Studio', icon: PenLine },
  { to: '/app/planner', label: 'Funding Planner', icon: Wallet },
  { to: '/app/insights', label: 'Insights', icon: BarChart3 },
  { to: '/app/learn', label: 'Learn', icon: BookOpen },
]

export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggle = useUIStore((s) => s.toggleSidebar)

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-border px-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-jade-600">
          <GraduationCap className="h-5 w-5 text-gold-400" />
        </span>
        {!collapsed && <span className="font-display text-xl font-bold">Grantly</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Main navigation">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500',
                collapsed && 'justify-center',
                isActive
                  ? 'bg-jade-50 dark:bg-jade-900/30 text-jade-700 dark:text-jade-300'
                  : 'text-ink-muted hover:bg-surface-2 hover:text-ink',
              )
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-3">
        <NavLink
          to="/app/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
              collapsed && 'justify-center',
              isActive
                ? 'bg-jade-50 dark:bg-jade-900/30 text-jade-700 dark:text-jade-300'
                : 'text-ink-muted hover:bg-surface-2 hover:text-ink',
            )
          }
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings className="h-5 w-5 shrink-0" strokeWidth={1.75} />
          {!collapsed && <span>Settings</span>}
        </NavLink>
        <button
          onClick={toggle}
          className={cn(
            'mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-ink-subtle hover:bg-surface-2 hover:text-ink',
            collapsed && 'justify-center',
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </div>
  )
}
