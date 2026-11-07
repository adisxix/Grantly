import { useState } from 'react'
import { Bell, Check } from 'lucide-react'
import { useNotificationStore } from '@/store/useNotificationStore'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/format'

const KIND_STYLES = {
  deadline: 'text-coral',
  status: 'text-info',
  tip: 'text-jade-600 dark:text-jade-400',
  system: 'text-ink-muted',
}

export function NotificationBell() {
  const notifications = useNotificationStore((s) => s.notifications)
  const markAllRead = useNotificationStore((s) => s.markAllRead)
  const markRead = useNotificationStore((s) => s.markRead)
  const [open, setOpen] = useState(false)
  const unread = notifications.filter((n) => !n.read).length

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative rounded-md p-2 text-ink-muted hover:bg-surface-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-1"
          aria-label={`Notifications${unread ? ` (${unread} unread)` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral px-1 text-[9px] font-bold text-white">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-sm font-semibold">Notifications</span>
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 text-xs text-jade-600 dark:text-jade-400 hover:underline"
            >
              <Check className="h-3 w-3" /> Mark all read
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-ink-muted">
              No notifications yet.
            </p>
          ) : (
            notifications.slice(0, 20).map((n) => (
              <button
                key={n.id}
                onClick={() => markRead(n.id)}
                className={cn(
                  'flex w-full flex-col gap-1 border-b border-border px-4 py-3 text-left hover:bg-surface-2',
                  !n.read && 'bg-jade-50/50 dark:bg-jade-900/10',
                )}
              >
                <div className="flex items-center gap-2">
                  <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', n.read ? 'bg-border' : 'bg-jade-600')} />
                  <span className={cn('text-sm font-medium', KIND_STYLES[n.kind])}>{n.title}</span>
                </div>
                <p className="pl-3.5 text-xs text-ink-muted">{n.body}</p>
                <span className="pl-3.5 text-[10px] text-ink-subtle">{formatDate(n.at, 'short')}</span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
