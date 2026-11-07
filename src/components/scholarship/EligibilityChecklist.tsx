import { Check, AlertCircle, X, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUS_ICONS = {
  met: Check,
  partial: AlertCircle,
  unmet: X,
  unknown: HelpCircle,
}

const STATUS_COLOURS = {
  met: 'text-jade-600 dark:text-jade-400 bg-jade-50 dark:bg-jade-900/20',
  partial: 'text-gold-600 dark:text-gold-400 bg-gold-50 dark:bg-gold-700/20',
  unmet: 'text-coral bg-coral/10',
  unknown: 'text-ink-subtle bg-surface-2',
}

/**
 * Per-criterion eligibility checklist with ✓ ! ✕ icons and fix hints.
 * @param {{ criteria: import('@/data/models').CriterionResult[] }} props
 */
export function EligibilityChecklist({ criteria }) {
  return (
    <ul className="space-y-2">
      {criteria.map((c) => {
        const Icon = STATUS_ICONS[c.status] || HelpCircle
        return (
          <li
            key={c.key}
            className="flex items-start gap-3 rounded-md border border-border bg-surface p-3"
          >
            <span
              className={cn(
                'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                STATUS_COLOURS[c.status],
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink">{c.label}</p>
              <p className="text-xs text-ink-muted">{c.text}</p>
              {c.fix && c.status !== 'met' && (
                <p className="mt-1 text-xs font-medium text-jade-700 dark:text-jade-300">
                  {c.fix}
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
