import { useParams, useNavigate } from 'react-router-dom'
import { useMemo, useEffect } from 'react'
import {
  Bookmark, BookmarkCheck, Calendar, Link2, Printer, ArrowLeft,
  FileText, PenLine, CheckCircle2, ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { ProgressRing } from '@/components/ui/progress-ring'
import { Avatar } from '@/components/ui/avatar'
import { DeadlineChip } from '@/components/scholarship/DeadlineChip'
import { MatchRing } from '@/components/scholarship/MatchRing'
import { EligibilityChecklist } from '@/components/scholarship/EligibilityChecklist'
import { useProfileStore } from '@/store/useProfileStore'
import { useApplicationStore } from '@/store/useApplicationStore'
import { useDocumentStore } from '@/store/useDocumentStore'
import { useEssayStore } from '@/store/useEssayStore'
import { getScholarship, ALL_SCHOLARSHIPS } from '@/data/scholarships'
import { computeMatch, matchColour } from '@/features/match/engine'
import { exportScholarshipICS } from '@/features/calendar/ics'
import { formatAmount, formatDate } from '@/lib/format'
import {
  SCHOLARSHIP_TYPE_LABELS, DOC_TYPE_LABELS, PROVIDER_LABELS,
} from '@/data/constants'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function ScholarshipDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const scholarship = getScholarship(id)
  const profile = useProfileStore((s) => s.profile)
  const isSaved = useApplicationStore((s) => s.isSaved(scholarship?.id))
  const saveScholarship = useApplicationStore((s) => s.saveScholarship)
  const unsaveScholarship = useApplicationStore((s) => s.unsaveScholarship)
  const documents = useDocumentStore((s) => s.documents)
  const createEssay = useEssayStore((s) => s.createEssay)

  const match = useMemo(
    () => (profile && scholarship ? computeMatch(profile, scholarship) : null),
    [profile, scholarship],
  )

  // 's' hotkey to save
  useEffect(() => {
    function onKey(e) {
      const tag = e.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) return
      if (e.key === 's' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        if (isSaved) {
          unsaveScholarship(scholarship.id)
          toast('Removed from saved')
        } else {
          saveScholarship(scholarship.id)
          toast.success('Saved to tracker')
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [scholarship, isSaved]) // eslint-disable-line react-hooks/exhaustive-deps

  const similar = useMemo(() => {
    if (!scholarship) return []
    return ALL_SCHOLARSHIPS
      .filter((s) => s.id !== scholarship.id && s.fields.some((f) => scholarship.fields.includes(f) || scholarship.fields.includes('Any')))
      .slice(0, 3)
  }, [scholarship])

  if (!scholarship) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="font-display text-2xl font-semibold">Scholarship not found</p>
        <Button onClick={() => navigate('/app/discover')}>Back to Discover</Button>
      </div>
    )
  }

  function handleSave() {
    if (isSaved) {
      unsaveScholarship(scholarship.id)
      toast('Removed from saved')
    } else {
      saveScholarship(scholarship.id)
      toast.success('Saved to tracker', { description: scholarship.name })
    }
  }

  function handleStartApplication() {
    if (!isSaved) saveScholarship(scholarship.id)
    navigate('/app/tracker')
  }

  function handleAddToCalendar() {
    exportScholarshipICS(scholarship)
    toast.success('Calendar event downloaded', { description: 'Import it into your calendar app.' })
  }

  function handleCopyLink() {
    navigator.clipboard?.writeText(window.location.href)
    toast.success('Link copied to clipboard')
  }

  function handlePrint() {
    window.print()
  }

  function handleWriteEssay(prompt) {
    const essay = createEssay({
      title: `${scholarship.name} Essay`,
      scholarshipId: scholarship.id,
      promptId: prompt.id,
      wordLimit: prompt.maxWords,
      html: '<p></p>',
    })
    if (isSaved) {
      const app = useApplicationStore.getState().getByScholarshipId(scholarship.id)
      if (app) useApplicationStore.getState().linkEssay(app.id, essay.id)
    }
    navigate(`/app/essays/${essay.id}`)
  }

  return (
    <div className="mx-auto max-w-content">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1 text-sm text-ink-muted hover:text-ink no-print"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Header */}
      <div className="card-base rounded-lg p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <Avatar name={scholarship.name} size={56} />
            <div>
              <h1 className="font-display text-2xl font-bold text-ink">{scholarship.name}</h1>
              <p className="text-sm text-ink-muted">{scholarship.provider} · {PROVIDER_LABELS[scholarship.providerType]}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {scholarship.types.map((t) => (
                  <Badge key={t} variant="jade" className="text-[10px]">{SCHOLARSHIP_TYPE_LABELS[t]}</Badge>
                ))}
                {scholarship.featured && <Badge variant="gold" className="text-[10px]">Featured</Badge>}
              </div>
            </div>
          </div>
          {match && (
            <MatchRing score={match.score} verdict={match.verdict} size={64} />
          )}
        </div>

        {/* Key facts */}
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <span className="font-mono font-semibold tabular-nums text-jade-700 dark:text-jade-300">
            {formatAmount(scholarship.amount)}
          </span>
          <span className="text-ink-muted">Deadline: <DeadlineChip deadline={scholarship.deadline} className="ml-1" /></span>
          <span className="text-ink-muted">Awards: {scholarship.awardsCount}</span>
          <span className="text-ink-muted">Difficulty: <span className="capitalize">{scholarship.difficulty}</span></span>
        </div>
      </div>

      {/* Sticky action bar */}
      <div className="sticky top-16 z-30 -mx-4 mt-4 flex items-center gap-2 rounded-lg border border-border bg-surface/95 px-4 py-2.5 backdrop-blur no-print md:mx-0">
        <Button size="sm" onClick={handleSave} variant={isSaved ? 'secondary' : 'primary'}>
          {isSaved ? <><BookmarkCheck className="h-4 w-4" /> Saved</> : <><Bookmark className="h-4 w-4" /> Save</>}
        </Button>
        <Button size="sm" onClick={handleStartApplication}>
          Start application <ChevronRight className="h-4 w-4" />
        </Button>
        <div className="ml-auto flex items-center gap-1">
          <Button size="iconSm" variant="ghost" onClick={handleAddToCalendar} title="Add to calendar">
            <Calendar className="h-4 w-4" />
          </Button>
          <Button size="iconSm" variant="ghost" onClick={handleCopyLink} title="Copy link">
            <Link2 className="h-4 w-4" />
          </Button>
          <Button size="iconSm" variant="ghost" onClick={handlePrint} title="Print">
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Overview */}
          <Card>
            <h2 className="mb-3 font-display text-lg font-semibold">Overview</h2>
            <p className="text-sm text-ink-muted leading-relaxed">{scholarship.description}</p>
          </Card>

          {/* Eligibility */}
          {match && (
            <Card>
              <div className="mb-4">
                <h2 className="font-display text-lg font-semibold">Eligibility</h2>
                <div className={cn(
                  'mt-2 flex items-center gap-2 rounded-md p-3',
                  match.verdict === 'eligible' && 'bg-success/10',
                  match.verdict === 'partial' && 'bg-gold-50 dark:bg-gold-700/20',
                  match.verdict === 'ineligible' && 'bg-coral/10',
                )}>
                  <ProgressRing value={match.score} size={40} tier={matchColour(match.score, match.verdict)} showLabel={false} />
                  <p className="text-sm font-medium">
                    {match.verdict === 'eligible' && 'You meet the key criteria — strong match!'}
                    {match.verdict === 'partial' && 'Partial match — some criteria may not align.'}
                    {match.verdict === 'ineligible' && 'You don\'t meet some hard requirements.'}
                  </p>
                </div>
              </div>
              <EligibilityChecklist criteria={match.criteria} />
            </Card>
          )}

          {/* Documents */}
          <Card>
            <h2 className="mb-3 font-display text-lg font-semibold">Documents needed</h2>
            <ul className="space-y-2">
              {scholarship.documentsRequired.map((docType) => {
                const hasDoc = documents.some((d) => d.type === docType)
                return (
                  <li key={docType} className="flex items-center justify-between rounded-md border border-border p-3">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-full',
                        hasDoc ? 'bg-success/10 text-success' : 'bg-surface-2 text-ink-subtle',
                      )}>
                        {hasDoc ? <CheckCircle2 className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                      </span>
                      <span className="text-sm">{DOC_TYPE_LABELS[docType] || docType}</span>
                    </div>
                    {hasDoc ? (
                      <Badge variant="success" className="text-[10px]">In vault</Badge>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => navigate('/app/documents')}>
                        Upload now
                      </Button>
                    )}
                  </li>
                )
              })}
            </ul>
          </Card>

          {/* How to apply */}
          <Card>
            <h2 className="mb-3 font-display text-lg font-semibold">How to apply</h2>
            <ol className="space-y-3">
              {scholarship.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-jade-50 dark:bg-jade-900/30 text-sm font-semibold text-jade-700 dark:text-jade-300">
                    {i + 1}
                  </span>
                  <p className="pt-1 text-sm text-ink">{step}</p>
                </li>
              ))}
            </ol>
          </Card>

          {/* Essay prompts */}
          {scholarship.essayPrompts && scholarship.essayPrompts.length > 0 && (
            <Card>
              <h2 className="mb-3 font-display text-lg font-semibold flex items-center gap-2">
                <PenLine className="h-4 w-4 text-jade-600" /> Essay prompts
              </h2>
              <div className="space-y-3">
                {scholarship.essayPrompts.map((prompt) => (
                  <div key={prompt.id} className="rounded-md border border-border p-4">
                    <p className="text-sm text-ink">{prompt.prompt}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <Badge variant="default" className="text-[10px]">{prompt.maxWords} words max</Badge>
                      <Button size="sm" variant="outline" onClick={() => handleWriteEssay(prompt)}>
                        <PenLine className="h-3.5 w-3.5" /> Write in Essay Studio
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* FAQ */}
          {scholarship.faqs.length > 0 && (
            <Card>
              <h2 className="mb-3 font-display text-lg font-semibold">FAQ</h2>
              <Accordion type="single" collapsible className="space-y-2">
                {scholarship.faqs.map((faq, i) => (
                  <AccordionItem key={i}>
                    <AccordionTrigger>{faq.q}</AccordionTrigger>
                    <AccordionContent>{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Card>
          )}

          {/* Similar */}
          {similar.length > 0 && (
            <Card>
              <h2 className="mb-3 font-display text-lg font-semibold">Similar scholarships</h2>
              <div className="space-y-2">
                {similar.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => navigate(`/app/scholarship/${s.slug}`)}
                    className="flex w-full items-center justify-between rounded-md border border-border p-3 text-left hover:bg-surface-2"
                  >
                    <div>
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-xs text-ink-muted">{s.provider} · {formatAmount(s.amount)}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-ink-subtle" />
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right rail */}
        <div className="space-y-4">
          <Card>
            <h3 className="mb-3 font-display text-base font-semibold">Key facts</h3>
            <dl className="space-y-3 text-sm">
              <Fact label="Provider" value={scholarship.provider} />
              <Fact label="Type" value={PROVIDER_LABELS[scholarship.providerType]} />
              <Fact label="Amount" value={formatAmount(scholarship.amount)} />
              <Fact label="Opens" value={formatDate(scholarship.opensOn, 'short')} />
              <Fact label="Deadline" value={formatDate(scholarship.deadline)} />
              <Fact label="Awards" value={String(scholarship.awardsCount)} />
              <Fact label="Est. time" value={`${scholarship.estimatedMinutes} min`} />
              <Fact label="Levels" value={scholarship.levels.map((l) => l.replace('_', ' ')).join(', ')} />
              <Fact label="Fields" value={scholarship.fields.join(', ')} />
              <Fact label="Countries" value={scholarship.countries.join(', ')} />
              {scholarship.minGpaPercent && <Fact label="Min GPA" value={`${scholarship.minGpaPercent}%`} />}
              {scholarship.maxFamilyIncomeINR && <Fact label="Max income" value={`₹${(scholarship.maxFamilyIncomeINR / 100000).toFixed(0)}L`} />}
            </dl>
            <Button
              variant="secondary"
              size="sm"
              className="mt-4 w-full"
              onClick={() => window.open(scholarship.website, '_blank', 'noopener,noreferrer')}
            >
              Visit official site
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Fact({ label, value }) {
  return (
    <div className="flex justify-between gap-2 border-b border-border pb-2">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="text-right font-medium capitalize">{value}</dd>
    </div>
  )
}
