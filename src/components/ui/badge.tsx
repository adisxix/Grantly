import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-surface-2 text-ink-muted border border-border',
        jade: 'bg-jade-50 dark:bg-jade-900/30 text-jade-700 dark:text-jade-300 border border-jade-200 dark:border-jade-800',
        gold: 'bg-gold-50 dark:bg-gold-700/20 text-gold-700 dark:text-gold-300 border border-gold-300/40',
        success: 'bg-success/10 text-success border border-success/30',
        warning: 'bg-warning/10 text-warning border border-warning/30',
        danger: 'bg-danger/10 text-danger border border-danger/30',
        info: 'bg-info/10 text-info border border-info/30',
        slate: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
        coral: 'bg-coral/10 text-coral border border-coral/30',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
