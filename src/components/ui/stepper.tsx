import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Horizontal stepper showing progress through N steps.
 * @param {{ steps: string[], current: number, className?: string }} props
 */
export function Stepper({ steps, current, className }) {
  return (
    <ol
      className={cn('flex items-center gap-2', className)}
      aria-label="Progress"
    >
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors',
                done && 'border-jade-600 bg-jade-600 text-white',
                active && 'border-jade-600 bg-surface text-jade-600',
                !done && !active && 'border-border bg-surface text-ink-subtle',
              )}
            >
              {done ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span
              className={cn(
                'hidden text-sm font-medium sm:block',
                done ? 'text-ink' : active ? 'text-ink' : 'text-ink-subtle',
              )}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <span
                className={cn(
                  'h-0.5 flex-1 rounded-full',
                  done ? 'bg-jade-600' : 'bg-border',
                )}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
