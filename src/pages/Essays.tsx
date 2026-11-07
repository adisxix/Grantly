import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, PenLine, Copy, Trash2, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { useEssayStore } from '@/store/useEssayStore'
import { getScholarship } from '@/data/scholarships'
import { countWords, formatDate } from '@/lib/format'
import { toast } from 'sonner'

export default function Essays() {
  const navigate = useNavigate()
  const essays = useEssayStore((s) => s.essays)
  const createEssay = useEssayStore((s) => s.createEssay)
  const duplicateEssay = useEssayStore((s) => s.duplicateEssay)
  const deleteEssay = useEssayStore((s) => s.deleteEssay)

  function handleNew() {
    const essay = createEssay({ title: 'Untitled essay' })
    navigate(`/app/essays/${essay.id}`)
  }

  return (
    <div className="mx-auto max-w-content space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted">{essays.length} essay{essays.length !== 1 ? 's' : ''}</p>
        <Button size="sm" onClick={handleNew}>
          <Plus className="h-4 w-4" /> New essay
        </Button>
      </div>

      {essays.length === 0 ? (
        <EmptyState
          icon={<PenLine className="h-8 w-8" />}
          title="No essays yet"
          description="Write your scholarship essays with a built-in coach, version history, and word limit tracking."
          action={<Button onClick={handleNew}>Start writing</Button>}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {essays.map((essay, i) => {
            const scholarship = essay.scholarshipId ? getScholarship(essay.scholarshipId) : null
            const wordCount = countWords(essay.html)
            const limitPct = essay.wordLimit ? (wordCount / essay.wordLimit) * 100 : 0
            return (
              <motion.div
                key={essay.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className="flex flex-col p-4">
                  <button onClick={() => navigate(`/app/essays/${essay.id}`)} className="text-left">
                    <div className="flex items-start justify-between">
                      <FileText className="h-5 w-5 text-ink-muted" />
                      <span className="text-xs text-ink-subtle">{formatDate(essay.updatedAt, 'short')}</span>
                    </div>
                    <h3 className="mt-2 truncate font-display text-base font-semibold">{essay.title}</h3>
                    {scholarship && (
                      <p className="mt-0.5 text-xs text-ink-muted">{scholarship.name}</p>
                    )}
                  </button>

                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <Badge variant="default" className="text-[10px]">{wordCount} words</Badge>
                    {essay.wordLimit && (
                      <Badge variant={limitPct > 100 ? 'danger' : limitPct > 90 ? 'warning' : 'jade'} className="text-[10px]">
                        {Math.round(limitPct)}% of limit
                      </Badge>
                    )}
                  </div>

                  {/* Word limit bar */}
                  {essay.wordLimit && (
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-2">
                      <div
                        className={`h-full rounded-full ${limitPct > 100 ? 'bg-danger' : limitPct > 90 ? 'bg-gold-500' : 'bg-jade-600'}`}
                        style={{ width: `${Math.min(100, limitPct)}%` }}
                      />
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-1 border-t border-border pt-3">
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/app/essays/${essay.id}`)}>
                      <PenLine className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button
                      size="iconSm"
                      variant="ghost"
                      onClick={() => { duplicateEssay(essay.id); toast.success('Essay duplicated') }}
                      title="Duplicate"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="iconSm"
                      variant="ghost"
                      onClick={() => { deleteEssay(essay.id); toast('Essay deleted') }}
                      title="Delete"
                      className="ml-auto text-coral hover:bg-coral/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
