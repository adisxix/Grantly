import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bookmark, BookmarkCheck, GitCompare, Eye } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { DeadlineChip } from './DeadlineChip'
import { MatchRing } from './MatchRing'
import { useProfileStore } from '@/store/useProfileStore'
import { useApplicationStore } from '@/store/useApplicationStore'
import { useUIStore } from '@/store/useUIStore'
import { computeMatch } from '@/features/match/engine'
import { formatAmount } from '@/lib/format'
import { SCHOLARSHIP_TYPE_LABELS } from '@/data/constants'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

/**
 * Scholarship card with match ring, save bookmark, compare checkbox, and quick view.
 * @param {{ scholarship: import('@/data/models').Scholarship, index?: number, layout?: 'grid'|'list' }} props
 */
export function ScholarshipCard({ scholarship, index = 0, layout = 'grid' }) {
  const navigate = useNavigate()
  const profile = useProfileStore((s) => s.profile)
  const isSaved = useApplicationStore((s) => s.isSaved(scholarship.id))
  const saveScholarship = useApplicationStore((s) => s.saveScholarship)
  const unsaveScholarship = useApplicationStore((s) => s.unsaveScholarship)
  const compareTray = useUIStore((s) => s.compareTray)
  const addToCompare = useUIStore((s) => s.addToCompare)
  const removeFromCompare = useUIStore((s) => s.removeFromCompare)

  const match = profile ? computeMatch(profile, scholarship) : null
  const inCompare = compareTray.includes(scholarship.id)

  function handleSave() {
    if (isSaved) {
      unsaveScholarship(scholarship.id)
      toast('Removed from saved', { description: scholarship.name })
    } else {
      saveScholarship(scholarship.id)
      toast.success('Saved to tracker', { description: scholarship.name })
    }
  }

  function handleCompare() {
    if (inCompare) removeFromCompare(scholarship.id)
    else {
      if (compareTray.length >= 3) {
        toast.error('Compare tray is full', { description: 'Remove one to add another.' })
        return
      }
      addToCompare(scholarship.id)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.04, 0.3) }}
      layout
    >
      <div
        className={cn(
          'card-base group relative flex flex-col p-4',
          layout === 'list' && 'sm:flex-row sm:items-center sm:gap-4',
        )}
      >
        {/* Top row */}
        <div className={cn('flex items-start gap-3', layout === 'list' && 'sm:flex-1')}>
          <Avatar name={scholarship.name} size={44} />
          <div className="min-w-0 flex-1">
            <button
              onClick={() => navigate(`/app/scholarship/${scholarship.slug}`)}
              className="text-left"
            >
              <h3 className="font-display text-base font-semibold leading-tight text-ink hover:text-jade-700 dark:hover:text-jade-300">
                {scholarship.name}
              </h3>
            </button>
            <p className="text-xs text-ink-muted">{scholarship.provider}</p>
          </div>
          {match && (
            <div className="shrink-0">
              <MatchRing score={match.score} verdict={match.verdict} size={48} showLabel={false} />
            </div>
          )}
        </div>

        {/* Amount */}
        <div className="mt-3 flex items-center gap-2">
          <span className="font-mono text-sm font-semibold tabular-nums text-jade-700 dark:text-jade-300">
            {formatAmount(scholarship.amount)}
          </span>
          {scholarship.amount.renewable && (
            <Badge variant="jade" className="text-[10px]">Renewable</Badge>
          )}
        </div>

        {/* Tags */}
        <div className="mt-2 flex flex-wrap gap-1">
          {scholarship.types.slice(0, 3).map((t) => (
            <Badge key={t} variant="default" className="text-[10px]">
              {SCHOLARSHIP_TYPE_LABELS[t] || t}
            </Badge>
          ))}
        </div>

        {/* Why it matches */}
        {match && match.reasons.length > 0 && (
          <p className="mt-2 line-clamp-2 text-xs text-ink-muted">
            {match.reasons[0]}
          </p>
        )}

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
          <DeadlineChip deadline={scholarship.deadline} />
          <div className="flex items-center gap-1">
            <button
              onClick={handleCompare}
              className={cn(
                'rounded-md p-1.5 transition-colors',
                inCompare ? 'bg-jade-50 text-jade-600 dark:bg-jade-900/30 dark:text-jade-400' : 'text-ink-subtle hover:bg-surface-2 hover:text-ink',
              )}
              aria-label={inCompare ? 'Remove from compare' : 'Add to compare'}
              title="Compare"
            >
              <GitCompare className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate(`/app/scholarship/${scholarship.slug}`)}
              className="rounded-md p-1.5 text-ink-subtle hover:bg-surface-2 hover:text-ink"
              aria-label="Quick view"
              title="View details"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={handleSave}
              className={cn(
                'rounded-md p-1.5 transition-colors',
                isSaved ? 'text-jade-600 dark:text-jade-400' : 'text-ink-subtle hover:bg-surface-2 hover:text-ink',
              )}
              aria-label={isSaved ? 'Saved' : 'Save'}
              title={isSaved ? 'Saved' : 'Save'}
            >
              {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
