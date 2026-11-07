import { useState } from 'react'
import {
  DndContext, DragOverlay, useDroppable,
  PointerSensor, KeyboardSensor, useSensor, useSensors, closestCorners,
} from '@dnd-kit/core'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid, Table2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { ApplicationCard } from '@/components/tracker/ApplicationCard'
import { ApplicationDrawer } from '@/components/tracker/ApplicationDrawer'
import { useApplicationStore } from '@/store/useApplicationStore'
import { useProfileStore } from '@/store/useProfileStore'
import { getScholarship } from '@/data/scholarships'
import { computeMatch, valuePerHour, readinessScore } from '@/features/match/engine'
import {
  APP_STATUSES, APP_STATUS_LABELS, APP_STATUS_COLORS,
} from '@/data/constants'
import { formatAmount, formatCurrency } from '@/lib/format'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const STATUS_COLOURS = {
  saved: 'border-slate-300',
  preparing: 'border-gold-400',
  submitted: 'border-info',
  under_review: 'border-jade-400',
  awarded: 'border-success',
  rejected: 'border-danger',
}

function KanbanColumn({ status, apps, onCardClick, columnColor }) {
  const { setNodeRef, isOver } = useDroppable({ id: `column-${status}` })
  const total = apps.reduce((sum, a) => {
    const s = getScholarship(a.scholarshipId)
    return sum + (a.amountAwarded || (s ? s.amount.max : 0))
  }, 0)

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex min-h-[200px] flex-col rounded-lg border-t-4 bg-surface-2/40 p-3 transition-colors',
        columnColor,
        isOver && 'bg-jade-50/50 dark:bg-jade-900/10',
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">{APP_STATUS_LABELS[status]}</h3>
          <Badge variant="default" className="px-1.5 text-[10px]">{apps.length}</Badge>
        </div>
        {status === 'awarded' && apps.length > 0 && (
          <span className="font-mono text-xs tabular-nums text-success">{formatCurrency(total, 'INR')}</span>
        )}
      </div>
      <div className="space-y-2">
        {apps.map((app) => (
          <ApplicationCard key={app.id} app={app} onClick={() => onCardClick(app.id)} />
        ))}
        {apps.length === 0 && (
          <p className="py-4 text-center text-xs text-ink-subtle">Drop here</p>
        )}
      </div>
    </div>
  )
}

export default function Tracker() {
  const navigate = useNavigate()
  const profile = useProfileStore((s) => s.profile)
  const applications = useApplicationStore((s) => s.applications)
  const moveApplication = useApplicationStore((s) => s.moveApplication)
  const [drawerId, setDrawerId] = useState(null)
  const [view, setView] = useState('board')
  const [activeApp, setActiveApp] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  )

  function handleDragStart(e) {
    setActiveApp(applications.find((a) => a.id === e.active.id) || null)
  }

  function handleDragEnd(e) {
    setActiveApp(null)
    const { active, over } = e
    if (!over) return
    const overId = String(over.id)
    if (!overId.startsWith('column-')) {
      // Dropped on another card — get that card's column
      const targetApp = applications.find((a) => a.id === overId)
      if (targetApp) {
        const newStatus = targetApp.status
        const dragged = applications.find((a) => a.id === active.id)
        if (dragged && dragged.status !== newStatus) {
          moveApplication(active.id, newStatus)
          toast(`Moved to ${APP_STATUS_LABELS[newStatus]}`, {
            description: getScholarship(dragged.scholarshipId)?.name,
          })
        }
      }
      return
    }
    const newStatus = overId.replace('column-', '')
    const dragged = applications.find((a) => a.id === active.id)
    if (dragged && dragged.status !== newStatus) {
      moveApplication(active.id, newStatus)
      toast(`Moved to ${APP_STATUS_LABELS[newStatus]}`, {
        description: getScholarship(dragged.scholarshipId)?.name,
      })
    }
  }

  if (applications.length === 0) {
    return (
      <div className="mx-auto max-w-content">
        <EmptyState
          icon={<LayoutGrid className="h-8 w-8" />}
          title="No applications yet"
          description="Save scholarships from Discover to start tracking them here."
          action={<Button onClick={() => navigate('/app/discover')}>Discover scholarships</Button>}
        />
      </div>
    )
  }

  // Group by status
  const columns = APP_STATUSES.map((status) => ({
    status,
    apps: applications.filter((a) => a.status === status),
  }))

  // For the table view, sort by value per hour
  const tableRows = applications.map((a) => {
    const s = getScholarship(a.scholarshipId)
    if (!s) return null
    const m = profile ? computeMatch(profile, s) : { score: 50 }
    const vph = valuePerHour(s, m.score)
    return { app: a, s, m, vph }
  }).filter(Boolean).sort((a, b) => b.vph - a.vph)

  return (
    <div className="mx-auto max-w-content space-y-4">
      {/* Header with view toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted">
          {applications.length} application{applications.length !== 1 ? 's' : ''} · {applications.filter((a) => a.status === 'awarded').length} awarded
        </p>
        <div className="flex items-center rounded-md border border-border">
          <button
            onClick={() => setView('board')}
            className={cn('rounded-l-md p-2', view === 'board' ? 'bg-jade-50 text-jade-600 dark:bg-jade-900/30 dark:text-jade-400' : 'text-ink-muted hover:bg-surface-2')}
            aria-label="Board view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView('table')}
            className={cn('rounded-r-md p-2', view === 'table' ? 'bg-jade-50 text-jade-600 dark:bg-jade-900/30 dark:text-jade-400' : 'text-ink-muted hover:bg-surface-2')}
            aria-label="Table view"
          >
            <Table2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {view === 'board' ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-3 overflow-x-auto pb-4 snap-x-mandatory">
            {columns.map((col) => (
              <div key={col.status} className="min-w-[260px] flex-1 snap-start">
                <KanbanColumn
                  status={col.status}
                  apps={col.apps}
                  onCardClick={setDrawerId}
                  columnColor={STATUS_COLOURS[col.status]}
                />
              </div>
            ))}
          </div>
          <DragOverlay>
            {activeApp ? (
              <div className="rotate-1 scale-[1.02] shadow-lift">
                <ApplicationCard app={activeApp} onClick={() => {}} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="card-base overflow-x-auto rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-ink-muted">
                <th className="p-3">Scholarship</th>
                <th className="p-3">Status</th>
                <th className="p-3">Readiness</th>
                <th className="p-3">Value/hr</th>
                <th className="p-3">Deadline</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map(({ app, s, m: _m, vph }) => (
                <tr
                  key={app.id}
                  onClick={() => setDrawerId(app.id)}
                  className="cursor-pointer border-b border-border hover:bg-surface-2"
                >
                  <td className="p-3">
                    <p className="font-medium">{s.name}</p>
                    <p className="text-xs text-ink-muted">{s.provider}</p>
                  </td>
                  <td className="p-3">
                    <Badge variant={APP_STATUS_COLORS[app.status]}>{APP_STATUS_LABELS[app.status]}</Badge>
                  </td>
                  <td className="p-3">
                    <span className="font-mono tabular-nums">{readinessScore(app, s)}%</span>
                  </td>
                  <td className="p-3 font-mono tabular-nums text-xs">
                    {formatCurrency(Math.round(vph), s.amount.currency)}
                  </td>
                  <td className="p-3 text-xs">{formatAmount(s.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ApplicationDrawer appId={drawerId} onClose={() => setDrawerId(null)} />
    </div>
  )
}
