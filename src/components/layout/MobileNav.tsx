import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Search, KanbanSquare, CalendarDays, Menu } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FolderOpen, PenLine, Wallet, BarChart3, BookOpen, Settings,
} from 'lucide-react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { cn } from '@/lib/utils'

const PRIMARY = [
  { to: '/app/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/app/discover', label: 'Discover', icon: Search },
  { to: '/app/tracker', label: 'Tracker', icon: KanbanSquare },
  { to: '/app/calendar', label: 'Calendar', icon: CalendarDays },
]

const MORE = [
  { to: '/app/documents', label: 'Documents', icon: FolderOpen },
  { to: '/app/essays', label: 'Essay Studio', icon: PenLine },
  { to: '/app/planner', label: 'Funding Planner', icon: Wallet },
  { to: '/app/insights', label: 'Insights', icon: BarChart3 },
  { to: '/app/learn', label: 'Learn', icon: BookOpen },
  { to: '/app/settings', label: 'Settings', icon: Settings },
]

export function MobileNav() {
  const [moreOpen, setMoreOpen] = useState(false)
  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
        aria-label="Mobile navigation"
      >
        {PRIMARY.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors',
                isActive ? 'text-jade-600 dark:text-jade-400' : 'text-ink-muted',
              )
            }
          >
            <item.icon className="h-5 w-5" strokeWidth={1.75} />
            <span>{item.label}</span>
          </NavLink>
        ))}
        <button
          onClick={() => setMoreOpen(true)}
          className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium text-ink-muted"
        >
          <Menu className="h-5 w-5" strokeWidth={1.75} />
          <span>More</span>
        </button>
      </nav>

      <Drawer open={moreOpen} onOpenChange={setMoreOpen}>
        <DrawerContent side="bottom">
          <DrawerHeader>
            <DrawerTitle>More</DrawerTitle>
          </DrawerHeader>
          <div className="grid grid-cols-3 gap-3 pb-6">
            {MORE.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMoreOpen(false)}
                className="flex flex-col items-center gap-1 rounded-md border border-border bg-surface-2 py-4 text-xs font-medium text-ink-muted hover:bg-surface hover:text-ink"
              >
                <item.icon className="h-5 w-5" strokeWidth={1.75} />
                <span className="text-center text-[10px]">{item.label}</span>
              </Link>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
