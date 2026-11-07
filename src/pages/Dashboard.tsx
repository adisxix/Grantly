import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles, Bookmark, Send, Wallet, Clock, TrendingUp,
  PenLine, Upload, AlertCircle,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProgressRing } from '@/components/ui/progress-ring'
import { EmptyState } from '@/components/ui/empty-state'
import { StatCard } from '@/components/dashboard/StatCard'
import { ScholarshipCard } from '@/components/scholarship/ScholarshipCard'
import { DeadlineChip } from '@/components/scholarship/DeadlineChip'
import { useProfileStore } from '@/store/useProfileStore'
import { useApplicationStore } from '@/store/useApplicationStore'
import { useDocumentStore } from '@/store/useDocumentStore'
import { SCHOLARSHIPS, getScholarship } from '@/data/scholarships'
import { computeMatch, readinessScore, profileStrength, matchColour } from '@/features/match/engine'
import { formatDeadline } from '@/lib/format'
import { daysBetween } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const navigate = useNavigate()
  const profile = useProfileStore((s) => s.profile)
  const applications = useApplicationStore((s) => s.applications)
  const documents = useDocumentStore((s) => s.documents)

  // Top matches
  const topMatches = useMemo(() => {
    if (!profile) return []
    return SCHOLARSHIPS
      .map((s) => ({ s, m: computeMatch(profile, s) }))
      .filter((x) => x.m.verdict !== 'ineligible')
      .sort((a, b) => b.m.score - a.m.score)
      .slice(0, 6)
  }, [profile])

  // Closing soon (saved applications by deadline)
  const closingSoon = useMemo(() => {
    return applications
      .map((a) => ({ a, s: getScholarship(a.scholarshipId) }))
      .filter((x) => x.s && daysBetween(Date.now(), x.s.deadline) >= 0)
      .sort((a, b) => new Date(a.s.deadline) - new Date(b.s.deadline))
      .slice(0, 5)
  }, [applications])

  // Stats
  const stats = useMemo(() => {
    const saved = applications.filter((a) => a.status === 'saved' || a.status === 'preparing').length
    const submitted = applications.filter((a) => a.status === 'submitted' || a.status === 'under_review').length
    const awarded = applications.filter((a) => a.status === 'awarded')
    const potential = topMatches
      .slice(0, 6)
      .reduce((sum, x) => sum + (x.s.amount.max * (x.m.score / 100)), 0)
    return {
      matches: topMatches.length,
      saved,
      submitted,
      potential,
      awarded: awarded.reduce((sum, a) => sum + (a.amountAwarded || 0), 0),
    }
  }, [applications, topMatches])

  // Readiness
  const avgReadiness = useMemo(() => {
    const prepping = applications.filter((a) => a.status === 'preparing' || a.status === 'saved')
    if (prepping.length === 0) return 0
    return Math.round(
      prepping.reduce((sum, a) => {
        const s = getScholarship(a.scholarshipId)
        return sum + readinessScore(a, s)
      }, 0) / prepping.length,
    )
  }, [applications])

  // Next best actions
  const nextActions = useMemo(() => {
    const actions = []
    // Missing documents
    const savedApps = applications.filter((a) => a.status === 'saved' || a.status === 'preparing')
    const neededDocs = new Set()
    for (const a of savedApps) {
      const s = getScholarship(a.scholarshipId)
      if (s) {
        s.documentsRequired.forEach((d) => {
          if (!documents.some((doc) => doc.type === d)) neededDocs.add(d)
        })
      }
    }
    if (neededDocs.size > 0) {
      actions.push({
        icon: Upload,
        text: `Upload your ${[...neededDocs].slice(0, 2).join(' and ')} — needed for ${savedApps.length} saved scholarships`,
        action: () => navigate('/app/documents'),
      })
    }
    // Essays pending
    const essayNeeded = savedApps.filter((a) => {
      const s = getScholarship(a.scholarshipId)
      return s && (s.essayPrompts || []).length > 0 && a.essayIds.length === 0
    })
    if (essayNeeded.length > 0) {
      actions.push({
        icon: PenLine,
        text: `${essayNeeded.length} scholarship${essayNeeded.length > 1 ? 's' : ''} need an essay draft`,
        action: () => navigate('/app/essays'),
      })
    }
    // Closing deadlines
    const urgent = closingSoon.filter((x) => daysBetween(Date.now(), x.s.deadline) <= 7)
    if (urgent.length > 0) {
      actions.push({
        icon: Clock,
        text: `${urgent[0].s.name} closes in ${formatDeadline(urgent[0].s.deadline).label}`,
        action: () => navigate(`/app/scholarship/${urgent[0].s.slug}`),
      })
    }
    // Complete profile
    if (profile && profileStrength(profile) < 100) {
      actions.push({
        icon: AlertCircle,
        text: 'Complete your profile for better matches',
        action: () => navigate('/app/settings'),
      })
    }
    return actions.slice(0, 4)
  }, [applications, documents, closingSoon, profile, navigate])

  const profilePct = profileStrength(profile)

  if (applications.length === 0 && topMatches.length > 0) {
    return (
      <div className="mx-auto max-w-content space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold">
            {greeting()}, {profile?.fullName?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-ink-muted">Here's your scholarship overview.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<Sparkles className="h-5 w-5" />} label="Matches" value={stats.matches} colour="jade" index={0} />
          <StatCard icon={<Bookmark className="h-5 w-5" />} label="Saved" value={stats.saved} colour="gold" index={1} />
          <StatCard icon={<Send className="h-5 w-5" />} label="Submitted" value={stats.submitted} colour="coral" index={2} />
          <StatCard icon={<Wallet className="h-5 w-5" />} label="Potential funding" value={Math.round(stats.potential / 1000)} prefix="₹" suffix="k" colour="info" index={3} />
        </div>

        <EmptyState
          icon={<Bookmark className="h-8 w-8" />}
          title="No saved scholarships yet"
          description="Browse your top matches and save the ones that fit."
          action={<Button onClick={() => navigate('/app/discover')}>Discover scholarships</Button>}
        />

        <div>
          <h2 className="mb-3 font-display text-lg font-semibold">Top matches</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {topMatches.slice(0, 6).map((m, i) => (
              <ScholarshipCard key={m.s.id} scholarship={m.s} index={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-content space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold">
          {greeting()}, {profile?.fullName?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="text-ink-muted">Here's your scholarship overview.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Sparkles className="h-5 w-5" />} label="Matches found" value={stats.matches} colour="jade" index={0} trend={[2, 4, 3, 5, 6, 4, 7]} />
        <StatCard icon={<Bookmark className="h-5 w-5" />} label="Saved & in progress" value={stats.saved} colour="gold" index={1} trend={[1, 2, 2, 3, 3, 4, 5]} />
        <StatCard icon={<Send className="h-5 w-5" />} label="Submitted" value={stats.submitted} colour="coral" index={2} trend={[0, 1, 1, 1, 2, 2, 3]} />
        <StatCard icon={<Wallet className="h-5 w-5" />} label="Potential funding" value={Math.round(stats.potential / 1000)} prefix="₹" suffix="k" colour="info" index={3} trend={[1, 2, 3, 3, 4, 5, 6]} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Closing soon */}
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-coral" /> Closing soon
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/app/calendar')}>
                View calendar
              </Button>
            </div>
            {closingSoon.length === 0 ? (
              <p className="text-sm text-ink-muted">No upcoming deadlines.</p>
            ) : (
              <div className="space-y-2">
                {closingSoon.map(({ a, s }) => {
                  const { tier } = formatDeadline(s.deadline)
                  return (
                    <button
                      key={a.id}
                      onClick={() => navigate(`/app/scholarship/${s.slug}`)}
                      className="flex w-full items-center justify-between rounded-md border border-border bg-surface-2/50 p-3 text-left hover:bg-surface-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">{s.name}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant={tier === 'urgent' ? 'danger' : tier === 'soon' ? 'gold' : 'slate'} className="text-[10px]">
                            {formatDeadline(s.deadline).label}
                          </Badge>
                          <span className="text-xs text-ink-muted capitalize">{a.status}</span>
                        </div>
                      </div>
                      <DeadlineChip deadline={s.deadline} />
                    </button>
                  )
                })}
              </div>
            )}
          </Card>

          {/* Top matches */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Top matches</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/app/discover')}>
                View all
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {topMatches.slice(0, 4).map((m, i) => (
                <ScholarshipCard key={m.s.id} scholarship={m.s} index={i} />
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Readiness */}
          <Card className="text-center">
            <h2 className="mb-3 font-display text-lg font-semibold">Readiness</h2>
            <ProgressRing value={avgReadiness} size={96} stroke={8} tier={matchColour(avgReadiness)} sublabel="ready" />
            <p className="mt-3 text-sm text-ink-muted">
              {avgReadiness >= 80 ? 'Almost ready to submit!' : avgReadiness >= 50 ? 'Good progress — keep going.' : 'Get started on your applications.'}
            </p>
            <Button variant="secondary" size="sm" className="mt-3 w-full" onClick={() => navigate('/app/tracker')}>
              Open tracker
            </Button>
          </Card>

          {/* Next best actions */}
          <Card>
            <h2 className="mb-3 font-display text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-jade-600" /> Next best actions
            </h2>
            {nextActions.length === 0 ? (
              <p className="text-sm text-ink-muted">You're all caught up! 🎉</p>
            ) : (
              <div className="space-y-2">
                {nextActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={action.action}
                    className="flex w-full items-start gap-3 rounded-md border border-border bg-surface-2/50 p-3 text-left hover:bg-surface-2"
                  >
                    <action.icon className="mt-0.5 h-4 w-4 shrink-0 text-jade-600 dark:text-jade-400" />
                    <span className="text-xs text-ink-muted">{action.text}</span>
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Funding snapshot */}
          <Card>
            <h2 className="mb-3 font-display text-lg font-semibold flex items-center gap-2">
              <Wallet className="h-4 w-4 text-gold-500" /> Funding snapshot
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-ink-muted">Secured (awarded)</span>
                <span className="font-semibold tabular-nums text-jade-700 dark:text-jade-300">{formatCurrency(stats.awarded, 'INR')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-muted">Expected (pending)</span>
                <span className="font-semibold tabular-nums">{formatCurrency(Math.round(stats.potential), 'INR')}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                <div className="h-full rounded-full bg-gradient-to-r from-jade-600 to-gold-500" style={{ width: `${Math.min(100, (stats.awarded / (stats.potential || 1)) * 100)}%` }} />
              </div>
              <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate('/app/planner')}>
                Open funding planner
              </Button>
            </div>
          </Card>

          {/* Profile strength */}
          <Card>
            <h2 className="mb-2 font-display text-lg font-semibold">Profile strength</h2>
            <div className="flex items-center gap-3">
              <ProgressRing value={profilePct} size={56} tier={matchColour(profilePct)} sublabel="complete" />
              <p className="text-sm text-ink-muted">
                {profilePct >= 90 ? 'Excellent — full matches enabled.' : 'Complete your profile for better matches.'}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
