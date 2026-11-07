import { GraduationCap } from 'lucide-react'

export function PageLoader() {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
      <span className="flex h-12 w-12 animate-pulse items-center justify-center rounded-xl bg-jade-600">
        <GraduationCap className="h-6 w-6 text-gold-400" />
      </span>
      <p className="text-sm text-ink-muted">Loading…</p>
    </div>
  )
}
