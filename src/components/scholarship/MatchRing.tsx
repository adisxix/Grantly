import { ProgressRing } from '@/components/ui/progress-ring'
import { matchColour } from '@/features/match/engine'
import { cn } from '@/lib/utils'

const TIER_LABELS = {
  excellent: 'Excellent',
  good: 'Good',
  partial: 'Partial',
  ineligible: 'Ineligible',
}

const TIER_OUTLINE = {
  excellent: 'border-jade-400',
  good: 'border-gold-400',
  partial: 'border-slate-400',
  ineligible: 'border-coral',
}

/**
 * Match ring with colour tier and optional one-line reason.
 * @param {{ score: number, verdict: string, size?: number, reason?: string, showLabel?: boolean, className?: string }} props
 */
export function MatchRing({ score, verdict, size = 56, _reason, showLabel = true, className }) {
  const tier = matchColour(score, verdict)
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <ProgressRing value={score} size={size} tier={tier} sublabel={showLabel ? 'match' : undefined} />
      {showLabel && (
        <div className="flex flex-col">
          <span className="text-xs font-semibold" style={{ color: { excellent: '#0E7C66', good: '#D99A1C', partial: '#64748B', ineligible: '#E8625A' }[tier] }}>
            {TIER_LABELS[tier]}
          </span>
        </div>
      )}
    </div>
  )
}

export { TIER_LABELS, TIER_OUTLINE }
