import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FileText, PenLine } from 'lucide-react'
import { DeadlineChip } from '@/components/scholarship/DeadlineChip'
import { ProgressRing } from '@/components/ui/progress-ring'
import { getScholarship } from '@/data/scholarships'
import { readinessScore, matchColour } from '@/features/match/engine'
import { cn } from '@/lib/utils'

/**
 * Sortable application card for the Kanban board.
 * @param {{ app: import('@/data/models').Application, onClick: () => void, isDragging?: boolean }} props
 */
export function ApplicationCard({ app, onClick }) {
  const scholarship = getScholarship(app.scholarshipId)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: app.id,
    data: { status: app.status, appId: app.id },
  })

  if (!scholarship) return null

  const readiness = readinessScore(app, scholarship)
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        'card-base cursor-grab rounded-md p-3 active:cursor-grabbing',
        isDragging && 'shadow-lift rotate-1 scale-[1.02]',
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick() }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold leading-tight text-ink">{scholarship.name}</p>
        <ProgressRing value={readiness} size={32} stroke={4} tier={matchColour(readiness)} showLabel={false} />
      </div>
      <p className="mt-0.5 text-xs text-ink-muted">{scholarship.provider}</p>
      <div className="mt-2 flex items-center justify-between">
        <DeadlineChip deadline={scholarship.deadline} />
        <div className="flex items-center gap-1.5 text-ink-subtle">
          {app.documentIds.length > 0 && (
            <span className="flex items-center gap-0.5 text-[10px]">
              <FileText className="h-3 w-3" /> {app.documentIds.length}
            </span>
          )}
          {app.essayIds.length > 0 && (
            <span className="flex items-center gap-0.5 text-[10px]">
              <PenLine className="h-3 w-3" /> {app.essayIds.length}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
