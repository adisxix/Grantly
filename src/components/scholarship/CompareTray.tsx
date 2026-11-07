import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, GitCompare, Check } from 'lucide-react'
import { useUIStore } from '@/store/useUIStore'
import { getScholarship } from '@/data/scholarships'
import { Button } from '@/components/ui/button'
import { formatAmount, formatDeadline } from '@/lib/format'
import { SCHOLARSHIP_TYPE_LABELS } from '@/data/constants'
import { cn } from '@/lib/utils'

function Row({ label, children }) {
  return (
    <div className="border-b border-border py-2">
      <span className="text-xs font-medium text-ink-muted">{label}</span>
      <div className="mt-0.5 text-sm text-ink">{children}</div>
    </div>
  )
}

export function CompareTray() {
  const navigate = useNavigate()
  const compareTray = useUIStore((s) => s.compareTray)
  const removeFromCompare = useUIStore((s) => s.removeFromCompare)
  const clearCompare = useUIStore((s) => s.clearCompare)

  if (compareTray.length === 0) return null

  const scholarships = compareTray.map((id) => getScholarship(id)).filter(Boolean)

  // Find best value per row
  const maxAmount = Math.max(...scholarships.map((s) => s.amount.max))
  const earliestDeadline = scholarships.reduce((min, s) =>
    new Date(s.deadline) < new Date(min) ? s : s,
  )

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-4 md:px-6">
      <AnimatePresence>
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="glass mx-auto max-w-content rounded-lg border border-border shadow-lift"
        >
          <div className="flex items-center justify-between px-4 py-3">
            <span className="flex items-center gap-2 text-sm font-semibold">
              <GitCompare className="h-4 w-4 text-jade-600" />
              Compare ({scholarships.length}/3)
            </span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={clearCompare}>
                Clear
              </Button>
            </div>
          </div>
          <div className="max-h-[60vh] overflow-auto px-4 pb-4">
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: `120px repeat(${scholarships.length}, minmax(0, 1fr))` }}
            >
              {/* Header row */}
              <div />
              {scholarships.map((s) => (
                <div key={s.id} className="flex items-start justify-between gap-1">
                  <button
                    onClick={() => navigate(`/app/scholarship/${s.slug}`)}
                    className="text-left text-sm font-semibold text-ink hover:text-jade-700 dark:hover:text-jade-300"
                  >
                    {s.name}
                  </button>
                  <button
                    onClick={() => removeFromCompare(s.id)}
                    className="shrink-0 rounded p-0.5 text-ink-subtle hover:bg-surface-2 hover:text-ink"
                    aria-label="Remove from compare"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              <Row label="Amount">
                {scholarships.map((s) => (
                  <div key={s.id} className={cn('flex items-center gap-1', s.amount.max === maxAmount && 'font-semibold text-jade-700 dark:text-jade-300')}>
                    {s.amount.max === maxAmount && <Check className="h-3 w-3" />}
                    {formatAmount(s.amount.amount || s.amount)}
                  </div>
                ))}
              </Row>

              <Row label="Max amount">
                {scholarships.map((s) => (
                  <span key={s.id} className={cn(s.amount.max === maxAmount && 'font-semibold text-jade-700 dark:text-jade-300')}>
                    {s.amount.currency === 'INR' ? '₹' : '$'}{s.amount.max.toLocaleString()}
                  </span>
                ))}
              </Row>

              <Row label="Deadline">
                {scholarships.map((s) => (
                  <span key={s.id} className={cn(s.id === earliestDeadline.id && 'font-semibold text-coral')}>
                    {formatDeadline(s.deadline).label}
                  </span>
                ))}
              </Row>

              <Row label="Type">
                {scholarships.map((s) => (
                  <span key={s.id}>
                    {s.types.map((t) => SCHOLARSHIP_TYPE_LABELS[t] || t).join(', ')}
                  </span>
                ))}
              </Row>

              <Row label="Difficulty">
                {scholarships.map((s) => (
                  <span key={s.id} className="capitalize">{s.difficulty}</span>
                ))}
              </Row>

              <Row label="Documents">
                {scholarships.map((s) => (
                  <span key={s.id}>{s.documentsRequired.length} required</span>
                ))}
              </Row>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
