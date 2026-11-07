import { useMemo } from 'react'
import {
  ResponsiveContainer, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts'
import { BarChart3, TrendingUp, Award, Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { useApplicationStore } from '@/store/useApplicationStore'
import { getScholarship, SCHOLARSHIPS } from '@/data/scholarships'
import { APP_STATUSES, APP_STATUS_LABELS, SCHOLARSHIP_TYPE_LABELS } from '@/data/constants'
import { formatCurrency } from '@/lib/format'
import { daysBetween } from '@/lib/utils'

const CHART_COLOURS = {
  jade: '#0E7C66', gold: '#F5B83D', sky: '#3B82C4', coral: '#E8625A', plum: '#8B5FBF', slate: '#64748B',
}

const STATUS_COLOURS = {
  saved: CHART_COLOURS.slate, preparing: CHART_COLOURS.gold, submitted: CHART_COLOURS.sky,
  under_review: CHART_COLOURS.jade, awarded: '#168A4A', rejected: '#C93A3A',
}

export default function Insights() {
  const applications = useApplicationStore((s) => s.applications)

  const stats = useMemo(() => {
    const awarded = applications.filter((a) => a.status === 'awarded')
    const submitted = applications.filter((a) => ['submitted', 'under_review', 'awarded', 'rejected'].includes(a.status))
    const successRate = submitted.length > 0 ? Math.round((awarded.length / submitted.length) * 100) : 0
    const totalSecured = awarded.reduce((sum, a) => sum + (a.amountAwarded || 0), 0)
    const totalPotential = applications.reduce((sum, a) => {
      const s = getScholarship(a.scholarshipId)
      return sum + (s ? s.amount.max : 0)
    }, 0)
    const avgTime = applications.reduce((sum, a) => {
      const s = getScholarship(a.scholarshipId)
      return sum + (s ? s.estimatedMinutes : 0)
    }, 0) / Math.max(1, applications.length)
    return { successRate, totalSecured, totalPotential, avgTime: Math.round(avgTime) }
  }, [applications])

  // Status distribution
  const statusData = useMemo(() => {
    return APP_STATUSES.map((s) => ({
      name: APP_STATUS_LABELS[s],
      value: applications.filter((a) => a.status === s).length,
      color: STATUS_COLOURS[s],
    })).filter((d) => d.value > 0)
  }, [applications])

  // Type distribution
  const typeData = useMemo(() => {
    const counts = {}
    applications.forEach((a) => {
      const s = getScholarship(a.scholarshipId)
      if (!s) return
      s.types.forEach((t) => {
        counts[t] = (counts[t] || 0) + 1
      })
    })
    return Object.entries(counts).map(([type, count]) => ({
      name: SCHOLARSHIP_TYPE_LABELS[type] || type,
      count,
    }))
  }, [applications])

  // Funding trend (secured vs potential over applications)
  const fundingData = useMemo(() => {
    const awarded = applications.filter((a) => a.status === 'awarded')
    const secured = awarded.reduce((sum, a) => sum + (a.amountAwarded || 0), 0)
    const potential = applications.reduce((sum, a) => {
      const s = getScholarship(a.scholarshipId)
      return sum + (s ? s.amount.max : 0)
    }, 0)
    return [
      { name: 'Secured', value: secured, fill: CHART_COLOURS.jade },
      { name: 'Expected', value: potential - secured, fill: CHART_COLOURS.gold },
    ]
  }, [applications])

  // Deadline density heatmap (90 days)
  const heatmap = useMemo(() => {
    const days = 90
    const grid = []
    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() + i * 86400000)
      const count = SCHOLARSHIPS.filter((s) => daysBetween(Date.now(), s.deadline) === i).length
      grid.push({ day: i, date, count })
    }
    return grid
  }, [])

  // Auto insights
  const autoInsights = useMemo(() => {
    const insights = []
    if (stats.successRate > 0) {
      insights.push(`Your success rate is ${stats.successRate}% across ${applications.filter((a) => ['submitted','under_review','awarded','rejected'].includes(a.status)).length} submitted applications.`)
    }
    if (stats.totalSecured > 0) {
      insights.push(`You've secured ${formatCurrency(stats.totalSecured, 'INR')} in scholarship funding.`)
    }
    const upcoming = SCHOLARSHIPS.filter((s) => daysBetween(Date.now(), s.deadline) <= 7 && daysBetween(Date.now(), s.deadline) >= 0).length
    if (upcoming > 0) {
      insights.push(`${upcoming} scholarship${upcoming > 1 ? 's have' : ' has'} deadlines within the next 7 days.`)
    }
    if (applications.length === 0) {
      insights.push('Start saving scholarships to unlock personalised insights.')
    }
    return insights
  }, [stats, applications])

  if (applications.length === 0) {
    return (
      <div className="mx-auto max-w-content">
        <EmptyState
          icon={<BarChart3 className="h-8 w-8" />}
          title="No data to analyze yet"
          description="Save and track scholarships to see your funding insights, success rate, and deadline density."
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-content space-y-6">
      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard icon={Award} label="Success rate" value={`${stats.successRate}%`} colour="jade" />
        <KPICard icon={TrendingUp} label="Secured funding" value={formatCurrency(stats.totalSecured, 'INR')} colour="gold" />
        <KPICard icon={BarChart3} label="Potential funding" value={formatCurrency(stats.totalPotential, 'INR')} colour="sky" />
        <KPICard icon={Clock} label="Avg time/app" value={`${stats.avgTime} min`} colour="coral" />
      </div>

      {/* Auto insights */}
      <Card>
        <h2 className="mb-3 font-display text-lg font-semibold">Insights</h2>
        <ul className="space-y-2">
          {autoInsights.map((insight, i) => (
            <li key={i} className="flex items-start gap-2 rounded-md bg-surface-2/50 p-2 text-sm">
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-jade-600" />
              <span className="text-ink-muted">{insight}</span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status donut */}
        <Card>
          <h3 className="mb-4 font-display text-base font-semibold">Applications by status</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: '8px' }} />
              <Legend className="text-xs" />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Funding area chart */}
        <Card>
          <h3 className="mb-4 font-display text-base font-semibold">Secured vs potential</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={fundingData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" horizontal={false} />
              <XAxis type="number" className="text-xs" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" className="text-xs" width={70} />
              <Tooltip formatter={(v) => formatCurrency(v, 'INR')} contentStyle={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: '8px' }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {fundingData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Type bar chart */}
        <Card>
          <h3 className="mb-4 font-display text-base font-semibold">Scholarships by type</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={typeData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" className="text-[10px]" angle={-30} textAnchor="end" height={60} />
              <YAxis className="text-xs" />
              <Tooltip contentStyle={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: '8px' }} />
              <Bar dataKey="count" fill={CHART_COLOURS.jade} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Deadline density heatmap */}
        <Card>
          <h3 className="mb-4 font-display text-base font-semibold">90-day deadline density</h3>
          <div className="grid grid-cols-[repeat(15,1fr)] gap-1">
            {heatmap.map((d) => (
              <div
                key={d.day}
                className="aspect-square rounded-sm"
                style={{
                  backgroundColor: d.count > 0
                    ? `rgb(14 124 102 / ${Math.min(1, d.count * 0.4)})`
                    : 'rgb(var(--c-surface-2))',
                }}
                title={`${d.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}: ${d.count} deadline${d.count !== 1 ? 's' : ''}`}
              />
            ))}
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-ink-muted">
            <span>Less</span>
            <span className="h-3 w-3 rounded-sm bg-surface-2" />
            <span className="h-3 w-3 rounded-sm" style={{ background: 'rgb(14 124 102 / 0.2)' }} />
            <span className="h-3 w-3 rounded-sm" style={{ background: 'rgb(14 124 102 / 0.5)' }} />
            <span className="h-3 w-3 rounded-sm" style={{ background: 'rgb(14 124 102 / 0.9)' }} />
            <span>More</span>
          </div>
        </Card>
      </div>
    </div>
  )
}

function KPICard({ icon: Icon, label, value, colour }) {
  return (
    <Card className="text-center">
      <Icon className="mx-auto h-6 w-6" style={{ color: { jade: '#0E7C66', gold: '#F5B83D', sky: '#3B82C4', coral: '#E8625A' }[colour] }} />
      <p className="mt-2 font-display text-xl font-bold tabular-nums">{value}</p>
      <p className="text-xs text-ink-muted">{label}</p>
    </Card>
  )
}
