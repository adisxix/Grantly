import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { formatDeadline } from '@/lib/format'
import { cn } from '@/lib/utils'

const TIER_STYLES = {
  overdue: 'bg-coral/10 text-coral border-coral/30',
  urgent: 'bg-warning/10 text-warning border-warning/30',
  soon: 'bg-gold-50 dark:bg-gold-700/20 text-gold-700 dark:text-gold-300 border-gold-300/40',
  comfortable: 'bg-surface-2 text-ink-muted border-border',
}

/**
 * Compact deadline chip with icon and urgency colour.
 * @param {{ deadline: string, className?: string }} props
 */
export function DeadlineChip({ deadline, className }) {
  const { label, tier } = formatDeadline(deadline)
  const Icon = tier === 'overdue' ? AlertTriangle : tier === 'urgent' ? Clock : tier === 'soon' ? Clock : CheckCircle2
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
        TIER_STYLES[tier],
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  )
}
