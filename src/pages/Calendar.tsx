import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Input, Label } from '@/components/ui/input'
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle,
} from '@/components/ui/drawer'
import { useApplicationStore } from '@/store/useApplicationStore'
import { getScholarship } from '@/data/scholarships'
import { generateICS, downloadICS } from '@/features/calendar/ics'
import { formatDeadline, formatDate } from '@/lib/format'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function Calendar() {
  const navigate = useNavigate()
  const applications = useApplicationStore((s) => s.applications)
  const [cursor, setCursor] = useState(() => new Date())
  const [events, setEvents] = useState([])
  const [drawerDay, setDrawerDay] = useState(null)
  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventDate, setNewEventDate] = useState('')

  // Build events from application deadlines
  const deadlineEvents = useMemo(() => {
    return applications
      .map((a) => {
        const s = getScholarship(a.scholarshipId)
        if (!s) return null
        return {
          id: `dl-${a.id}`,
          date: s.deadline,
          title: s.name,
          type: 'deadline',
          status: a.status,
          slug: s.slug,
        }
      })
      .filter(Boolean)
  }, [applications])

  const allEvents = [...deadlineEvents, ...events]

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const today = new Date()
  const isToday = (d) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  function eventsForDay(day) {
    return allEvents.filter((e) => {
      const ed = new Date(e.date)
      return ed.getDate() === day && ed.getMonth() === month && ed.getFullYear() === year
    })
  }

  function prevMonth() {
    setCursor(new Date(year, month - 1, 1))
  }
  function nextMonth() {
    setCursor(new Date(year, month + 1, 1))
  }

  function handleDayClick(day) {
    setDrawerDay({ day, events: eventsForDay(day) })
    setNewEventDate(new Date(year, month, day).toISOString().slice(0, 10))
  }

  function addEvent() {
    if (!newEventTitle.trim() || !newEventDate) return
    setEvents((e) => [
      ...e,
      {
        id: `ev-${Date.now()}`,
        date: newEventDate,
        title: newEventTitle,
        type: 'custom',
      },
    ])
    setNewEventTitle('')
    toast.success('Event added')
  }

  function exportAll() {
    const combined = allEvents
      .map((e) =>
        generateICS({
          title: e.title,
          description: e.type === 'deadline' ? 'Scholarship deadline' : 'Custom event',
          deadline: e.date,
        }),
      )
      .join('\r\n')
      .replace(/BEGIN:VCALENDAR\r\n/g, '')
      .replace(/\r\nEND:VCALENDAR/g, '')
    const ics = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Grantly//Calendar//EN' + combined + '\r\nEND:VCALENDAR'
    downloadICS(ics, 'grantly-calendar.ics')
  }

  const eventTypeColor = {
    deadline: 'bg-coral',
    custom: 'bg-info',
  }

  return (
    <div className="mx-auto max-w-content space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={prevMonth} aria-label="Previous month">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="font-display text-lg font-semibold">
            {MONTHS[month]} {year}
          </h2>
          <Button variant="ghost" size="icon" onClick={nextMonth} aria-label="Next month">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={exportAll}>
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button size="sm" onClick={() => { setDrawerDay({ day: today.getDate(), events: eventsForDay(today.getDate()) }); setNewEventDate(today.toISOString().slice(0, 10)) }}>
            <Plus className="h-4 w-4" /> Add event
          </Button>
        </div>
      </div>

      {allEvents.length === 0 ? (
        <EmptyState
          icon={<CalendarIcon className="h-8 w-8" />}
          title="No deadlines or events yet"
          description="Save scholarships or add custom events to see them here."
          action={<Button onClick={() => navigate('/app/discover')}>Discover scholarships</Button>}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Calendar grid */}
          <div className="lg:col-span-2">
            <Card className="p-4">
              <div className="grid grid-cols-7 gap-1">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="pb-2 text-center text-xs font-medium text-ink-muted">
                    {d}
                  </div>
                ))}
                {Array.from({ length: firstDay }, (_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1
                  const dayEvents = eventsForDay(day)
                  return (
                    <button
                      key={day}
                      onClick={() => handleDayClick(day)}
                      className={cn(
                        'flex min-h-[64px] flex-col rounded-md border border-transparent p-1 text-left hover:bg-surface-2',
                        isToday(day) && 'border-jade-600 bg-jade-50 dark:bg-jade-900/20',
                      )}
                    >
                      <span className={cn(
                        'text-xs font-medium',
                        isToday(day) ? 'text-jade-700 dark:text-jade-300' : 'text-ink-muted',
                      )}>
                        {day}
                      </span>
                      <div className="mt-0.5 space-y-0.5">
                        {dayEvents.slice(0, 2).map((e) => (
                          <div
                            key={e.id}
                            className={cn('truncate rounded px-1 py-0.5 text-[9px] text-white', eventTypeColor[e.type] || 'bg-slate-400')}
                            title={e.title}
                          >
                            {e.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <p className="text-[9px] text-ink-subtle">+{dayEvents.length - 2} more</p>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </Card>
          </div>

          {/* Agenda list */}
          <div className="space-y-3">
            <h3 className="font-display text-base font-semibold">Upcoming</h3>
            <div className="space-y-2">
              {allEvents
                .filter((e) => new Date(e.date) >= new Date(today.getFullYear(), today.getMonth(), today.getDate()))
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .slice(0, 10)
                .map((e) => (
                  <button
                    key={e.id}
                    onClick={() => e.slug ? navigate(`/app/scholarship/${e.slug}`) : null}
                    className="flex w-full items-center gap-3 rounded-md border border-border p-3 text-left hover:bg-surface-2"
                  >
                    <div className={cn('h-2 w-2 rounded-full shrink-0', eventTypeColor[e.type] || 'bg-slate-400')} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{e.title}</p>
                      <p className="text-xs text-ink-muted">{formatDate(e.date, 'short')} · {formatDeadline(e.date).label}</p>
                    </div>
                    {e.status && (
                      <Badge variant="default" className="text-[10px] capitalize">{e.status}</Badge>
                    )}
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Day drawer */}
      <Drawer open={!!drawerDay} onOpenChange={(o) => !o && setDrawerDay(null)}>
        <DrawerContent side="right" className="w-full max-w-md">
          <DrawerHeader>
            <DrawerTitle>
              {drawerDay ? formatDate(new Date(year, month, drawerDay.day).toISOString(), 'medium') : ''}
            </DrawerTitle>
          </DrawerHeader>
          <div className="space-y-4 pb-6 pr-2">
            <div className="space-y-2">
              {drawerDay?.events.map((e) => (
                <div key={e.id} className="rounded-md border border-border p-3">
                  <p className="text-sm font-medium">{e.title}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant={e.type === 'deadline' ? 'danger' : 'info'} className="text-[10px]">
                      {e.type === 'deadline' ? 'Deadline' : 'Event'}
                    </Badge>
                    {e.slug && (
                      <Button size="sm" variant="ghost" onClick={() => navigate(`/app/scholarship/${e.slug}`)}>
                        View
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {drawerDay?.events.length === 0 && (
                <p className="text-sm text-ink-muted">No events on this day.</p>
              )}
            </div>

            <div className="border-t border-border pt-4">
              <Label htmlFor="event-title">Add custom event</Label>
              <Input
                id="event-title"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addEvent()}
                placeholder="Event title"
                className="mt-1.5"
              />
              <Button size="sm" className="mt-2 w-full" onClick={addEvent}>
                <Plus className="h-4 w-4" /> Add event
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
