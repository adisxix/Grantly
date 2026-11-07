import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid,
} from 'recharts'
import { Wallet, TrendingUp, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { EmptyState } from '@/components/ui/empty-state'
import { useApplicationStore } from '@/store/useApplicationStore'
import { useProfileStore } from '@/store/useProfileStore'
import { getScholarship } from '@/data/scholarships'
import { computeMatch, valuePerHour } from '@/features/match/engine'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'

export default function Planner() {
  const navigate = useNavigate()
  const profile = useProfileStore((s) => s.profile)
  const applications = useApplicationStore((s) => s.applications)

  const [costs, setCosts] = useState({
    tuition: 120000,
    living: 60000,
    books: 10000,
    other: 5000,
    family: 40000,
    savings: 20000,
    otherAid: 0,
    years: 2,
  })
  const [enabledApps, setEnabledApps] = useState({})

  // Calculate totals
  const totalCost = useMemo(() => {
    const annual = costs.tuition + costs.living + costs.books + costs.other
    return annual * costs.years
  }, [costs])

  const totalFunds = useMemo(() => {
    return (costs.family + costs.savings + costs.otherAid) * costs.years
  }, [costs])

  // Secured (awarded)
  const secured = useMemo(() => {
    return applications
      .filter((a) => a.status === 'awarded')
      .reduce((sum, a) => sum + (a.amountAwarded || 0), 0)
  }, [applications])

  // Expected from pending applications
  const pendingApps = useMemo(() => {
    return applications
      .filter((a) => a.status === 'submitted' || a.status === 'under_review' || a.status === 'preparing' || a.status === 'saved')
      .map((a) => {
        const s = getScholarship(a.scholarshipId)
        if (!s) return null
        const m = profile ? computeMatch(profile, s) : { score: 50 }
        const expected = ((s.amount.min + s.amount.max) / 2) * (m.score / 100)
        const enabled = enabledApps[a.id] !== false
        return { app: a, s, m, expected, vph: valuePerHour(s, m.score), enabled }
      })
      .filter(Boolean)
      .sort((a, b) => b.vph - a.vph)
  }, [applications, profile, enabledApps])

  const expectedValue = useMemo(() => {
    return pendingApps.filter((x) => x.enabled).reduce((sum, x) => sum + x.expected, 0)
  }, [pendingApps])

  const gap = Math.max(0, totalCost - totalFunds - secured - expectedValue)
  const totalSecuredFunds = costs.family + costs.savings + costs.otherAid + secured
  const totalExpectedFunds = totalSecuredFunds + expectedValue

  // Chart data by year
  const chartData = useMemo(() => {
    const annualCost = (costs.tuition + costs.living + costs.books + costs.other)
    const annualSecured = (secured / costs.years) + costs.family + costs.savings + costs.otherAid
    const annualExpected = expectedValue / costs.years
    return Array.from({ length: costs.years }, (_, i) => ({
      year: `Year ${i + 1}`,
      Cost: annualCost,
      Secured: Math.round(annualSecured),
      Expected: Math.round(annualExpected),
      Gap: Math.max(0, annualCost - annualSecured - annualExpected),
    }))
  }, [costs, secured, expectedValue])

  // Progress bar widths
  return (
    <div className="mx-auto max-w-content space-y-6">
      {/* Inputs */}
      <Card>
        <h2 className="mb-4 font-display text-lg font-semibold flex items-center gap-2">
          <Wallet className="h-5 w-5 text-gold-500" /> Your costs & funds
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <NumberField label="Tuition / yr" value={costs.tuition} onChange={(v) => setCosts({ ...costs, tuition: v })} />
          <NumberField label="Living / yr" value={costs.living} onChange={(v) => setCosts({ ...costs, living: v })} />
          <NumberField label="Books / yr" value={costs.books} onChange={(v) => setCosts({ ...costs, books: v })} />
          <NumberField label="Other / yr" value={costs.other} onChange={(v) => setCosts({ ...costs, other: v })} />
          <NumberField label="Family contribution / yr" value={costs.family} onChange={(v) => setCosts({ ...costs, family: v })} />
          <NumberField label="Savings / yr" value={costs.savings} onChange={(v) => setCosts({ ...costs, savings: v })} />
          <NumberField label="Other aid / yr" value={costs.otherAid} onChange={(v) => setCosts({ ...costs, otherAid: v })} />
          <div>
            <Label>Years: {costs.years}</Label>
            <div className="mt-3 flex gap-1">
              {[1, 2, 3, 4].map((y) => (
                <button
                  key={y}
                  onClick={() => setCosts({ ...costs, years: y })}
                  className={cn(
                    'h-11 flex-1 rounded-md border text-sm font-medium transition-colors',
                    costs.years === y ? 'border-jade-600 bg-jade-50 text-jade-700 dark:bg-jade-900/30 dark:text-jade-300' : 'border-border hover:bg-surface-2',
                  )}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="text-center">
          <p className="text-xs text-ink-muted">Total cost ({costs.years} yr)</p>
          <p className="mt-1 font-display text-2xl font-bold tabular-nums">{formatCurrency(totalCost, 'INR')}</p>
        </Card>
        <Card className="text-center">
          <p className="text-xs text-ink-muted">Secured + expected</p>
          <p className="mt-1 font-display text-2xl font-bold tabular-nums text-jade-700 dark:text-jade-300">{formatCurrency(totalExpectedFunds, 'INR')}</p>
        </Card>
        <Card className="text-center">
          <p className="text-xs text-ink-muted">Funding gap</p>
          <p className={cn('mt-1 font-display text-2xl font-bold tabular-nums', gap > 0 ? 'text-coral' : 'text-success')}>
            {formatCurrency(gap, 'INR')}
          </p>
        </Card>
      </div>

      {/* Progress bar */}
      <Card>
        <h3 className="mb-3 text-sm font-semibold">Funding progress</h3>
        <div className="flex h-8 overflow-hidden rounded-md border border-border">
          <div className="bg-success flex items-center justify-center text-[10px] font-medium text-white" style={{ width: `${Math.max(2, (totalSecuredFunds / totalCost) * 100)}%` }}>
            Secured
          </div>
          <div className="bg-gold-500 flex items-center justify-center text-[10px] font-medium text-ink" style={{ width: `${Math.max(1, (expectedValue / totalCost) * 100)}%` }}>
            Expected
          </div>
          <div className="bg-coral/30 flex items-center justify-center text-[10px] font-medium text-coral" style={{ width: `${(gap / totalCost) * 100}%` }}>
            Gap
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-xs">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-success" /> Secured: {formatCurrency(totalSecuredFunds, 'INR')}</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-gold-500" /> Expected: {formatCurrency(expectedValue, 'INR')}</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-coral/50" /> Gap: {formatCurrency(gap, 'INR')}</span>
        </div>
      </Card>

      {/* Chart */}
      <Card>
        <h3 className="mb-4 text-sm font-semibold">Projection by year</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="year" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: '8px' }}
              formatter={(v) => formatCurrency(v, 'INR')}
            />
            <Bar dataKey="Cost" fill="#E8625A" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Secured" fill="#168A4A" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Expected" fill="#F5B83D" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Strategy list */}
      <Card>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <TrendingUp className="h-4 w-4 text-jade-600" /> Strategy — ranked by value per hour
        </h3>
        {pendingApps.length === 0 ? (
          <EmptyState
            icon={<Wallet className="h-8 w-8" />}
            title="No pending applications"
            description="Save scholarships to see your funding strategy here."
            action={<Button onClick={() => navigate('/app/discover')}>Discover scholarships</Button>}
          />
        ) : (
          <div className="space-y-2">
            {pendingApps.map(({ app, s, m, expected, vph, enabled }) => (
              <div key={app.id} className="flex items-center gap-3 rounded-md border border-border p-3">
                <Switch
                  checked={enabled}
                  onCheckedChange={(v) => setEnabledApps({ ...enabledApps, [app.id]: v })}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-ink-muted">Match: {m.score}% · Expected: {formatCurrency(expected, s.amount.currency)}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs tabular-nums text-jade-700 dark:text-jade-300">{formatCurrency(Math.round(vph), s.amount.currency)}/hr</p>
                  <Button size="sm" variant="ghost" onClick={() => navigate(`/app/scholarship/${s.slug}`)}>
                    Start <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

function NumberField({ label, value, onChange }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="relative mt-1.5">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle">₹</span>
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="pl-7"
        />
      </div>
    </div>
  )
}
