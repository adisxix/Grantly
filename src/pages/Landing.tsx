import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Sparkles, Target, ShieldCheck, Calendar, FolderOpen, PenLine,
  Wallet, BarChart3, ArrowRight, Search,
  GraduationCap, BookOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Label } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { useProfileStore } from '@/store/useProfileStore'
import { SCHOLARSHIPS } from '@/data/scholarships'
import { computeMatch, matchColour } from '@/features/match/engine'
import { EDUCATION_LEVELS, EDUCATION_LABELS, FIELDS_OF_STUDY } from '@/data/constants'
import { formatAmount, formatINRShort } from '@/lib/format'
import { loadDemo } from '@/features/demo/loadDemo'
import { ProgressRing } from '@/components/ui/progress-ring'
import { cn } from '@/lib/utils'

const FAQS = [
  { q: 'Is Grantly free to use?', a: 'Yes. Grantly is completely free and works offline. All your data stays on your device — no sign-up, no servers, no tracking.' },
  { q: 'Does Grantly apply for me?', a: 'No. Grantly helps you discover, understand, and track scholarships, but you submit applications yourself through the official provider.' },
  { q: 'Is the scholarship data real?', a: 'The demo data is fictional but realistic, for illustration. Always verify with the official provider before applying.' },
  { q: 'Will my data be safe?', a: 'Everything is stored locally in your browser (localStorage and IndexedDB). Nothing leaves your device.' },
]

function CountUp({ end, duration = 1200 }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start
    let raf
    const step = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      setVal(Math.round(progress * end))
      if (progress < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [end, duration])
  return <span className="tabular-nums">{val}</span>
}

export default function Landing() {
  const navigate = useNavigate()
  const hasProfile = useProfileStore((s) => !!s.profile)

  // Eligibility mini-widget state
  const [level, setLevel] = useState('undergraduate')
  const [field, setField] = useState('Engineering')
  const [income, setIncome] = useState(500000)

  const matches = useMemo(() => {
    const demoP = {
      id: 'mini', educationLevel: level, fieldOfStudy: field,
      familyIncomeINR: income, country: 'India', state: 'Karnataka',
      gender: 'female', category: 'General', gpaPercent: 80,
      firstGen: false, hasDisability: false, interests: [],
    }
    return SCHOLARSHIPS
      .map((s) => ({ s, m: computeMatch(demoP, s) }))
      .filter((x) => x.m.verdict !== 'ineligible' || x.m.score >= 30)
      .sort((a, b) => b.m.score - a.m.score)
      .slice(0, 3)
  }, [level, field, income])

  const stats = useMemo(() => ({
    scholarships: SCHOLARSHIPS.length,
    totalFunding: SCHOLARSHIPS.reduce((sum, s) => sum + s.amount.max, 0),
    featured: SCHOLARSHIPS.filter((s) => s.featured).length,
    fields: FIELDS_OF_STUDY.length,
  }), [])

  function start() {
    if (hasProfile) navigate('/app/dashboard')
    else navigate('/onboarding')
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 grain-overlay md:pt-40">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% -10%, rgb(7 59 50 / 0.15), transparent), radial-gradient(ellipse 60% 40% at 80% 0%, rgb(245 184 61 / 0.1), transparent)',
          }}
        />
        <div className="mx-auto grid max-w-content items-center gap-12 px-4 md:grid-cols-2 md:px-8">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Badge variant="jade" className="mb-4 gap-1">
                <Sparkles className="h-3 w-3" /> Find it. Fit it. Fund it.
              </Badge>
              <h1 className="text-balance font-display text-4xl font-bold leading-[1.1] text-ink md:text-5xl lg:text-6xl">
                Find the funding you deserve, without the paperwork maze.
              </h1>
              <p className="mt-5 max-w-md text-balance text-lg text-ink-muted">
                Grantly learns who you are, matches you with scholarships you can
                realistically win, explains eligibility in plain language, and
                tracks everything in one calm place.
              </p>
              <div id="demo-cta" className="mt-8 flex flex-wrap gap-3">
                <Button variant="cta" size="lg" onClick={start}>
                  Get started <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => { loadDemo(); setTimeout(() => navigate('/app/dashboard'), 600) }}
                >
                  Explore demo
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Floating match cards */}
          <div className="relative hidden h-[400px] md:block">
            {matches.map((m, i) => (
              <motion.div
                key={m.s.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.15, duration: 0.4 }}
                className="absolute w-64"
                style={{
                  top: `${20 + i * 110}px`,
                  right: `${i * 20}px`,
                  zIndex: 3 - i,
                }}
              >
                <Card className="p-4 shadow-lift">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-ink">{m.s.name}</p>
                      <p className="text-xs text-ink-muted">{m.s.provider}</p>
                    </div>
                    <ProgressRing value={m.m.score} size={44} tier={matchColour(m.m.score, m.m.verdict)} showLabel={false} />
                  </div>
                  <p className="mt-2 font-mono text-xs tabular-nums text-jade-700 dark:text-jade-300">
                    {formatAmount(m.s.amount)}
                  </p>
                  <p className="mt-1 text-[11px] text-ink-muted line-clamp-1">
                    {m.m.reasons[0] || 'Great match for your profile'}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-content grid-cols-2 gap-4 px-4 py-8 md:grid-cols-4 md:px-8">
          {[
            { label: 'Scholarships', value: stats.scholarships, suffix: '+' },
            { label: 'Total funding tracked', value: stats.totalFunding, prefix: '₹', format: formatINRShort },
            { label: 'Featured programs', value: stats.featured },
            { label: 'Fields covered', value: stats.fields },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="font-display text-3xl font-bold text-jade-700 dark:text-jade-300">
                {stat.prefix}{stat.format ? stat.format(stat.value) : <CountUp end={stat.value} />}{stat.suffix}
              </p>
              <p className="mt-1 text-xs text-ink-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Problem → Solution */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-content px-4 md:px-8">
          <h2 className="text-balance text-center font-display text-3xl font-bold md:text-4xl">
            Three pillars that change the game
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-ink-muted">
            Scholarship hunting is broken. Grantly fixes it with clarity, confidence, and control.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { icon: Target, title: 'Clarity', desc: 'See eligibility in plain language with a ✓, !, or ✕ for every criterion. No more decoding PDFs.' },
              { icon: ShieldCheck, title: 'Confidence', desc: 'A match score on every card tells you your realistic chances. Focus your effort where it counts.' },
              { icon: Calendar, title: 'Control', desc: 'Track every application from saved to awarded. Never miss a deadline again.' },
            ].map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-jade-50 dark:bg-jade-900/30">
                    <p.icon className="h-6 w-6 text-jade-600 dark:text-jade-400" />
                  </div>
                  <h3 className="mt-4 font-display text-xl font-semibold">{p.title}</h3>
                  <p className="mt-2 text-sm text-ink-muted">{p.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-surface-2/50 py-20">
        <div className="mx-auto max-w-content px-4 md:px-8">
          <h2 className="text-center font-display text-3xl font-bold md:text-4xl">How it works</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-4">
            {[
              { num: '01', title: 'Tell us about you', desc: 'A 5-step onboarding captures your level, field, finances, and goals.' },
              { num: '02', title: 'Get matched', desc: 'Our engine scores every scholarship against your profile in seconds.' },
              { num: '03', title: 'Understand eligibility', desc: 'Plain-language criteria with fix hints for anything you don\'t meet yet.' },
              { num: '04', title: 'Track to the finish', desc: 'Kanban board, deadlines, documents, essays, and funding — all in one place.' },
            ].map((step, i) => (
              <div key={step.num} className="relative">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-2xl font-bold text-jade-600 dark:text-jade-400">{step.num}</span>
                  {i < 3 && <span className="hidden h-px flex-1 bg-border md:block" />}
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-ink-muted">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Eligibility mini-widget */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 md:px-8">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Am I eligible?</h2>
            <p className="mt-2 text-ink-muted">Try it yourself — see live matches in seconds.</p>
          </div>
          <Card className="mt-8 p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="el-level">Education level</Label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger id="el-level"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EDUCATION_LEVELS.map((l) => (
                      <SelectItem key={l} value={l}>{EDUCATION_LABELS[l]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="el-field">Field of study</Label>
                <Select value={field} onValueChange={setField}>
                  <SelectTrigger id="el-field"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FIELDS_OF_STUDY.map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Family income: ₹{(income / 100000).toFixed(1)}L</Label>
                <Slider
                  value={[income]}
                  onValueChange={([v]) => setIncome(v)}
                  min={100000}
                  max={2000000}
                  step={50000}
                  className="mt-4"
                />
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {matches.map((m) => (
                <div key={m.s.id} className="flex items-center gap-3 rounded-md border border-border bg-surface-2/50 p-3">
                  <ProgressRing value={m.m.score} size={40} tier={matchColour(m.m.score, m.m.verdict)} showLabel={false} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">{m.s.name}</p>
                    <p className="truncate text-xs text-ink-muted">{m.m.reasons[0]}</p>
                  </div>
                  <span className="font-mono text-sm tabular-nums text-jade-700 dark:text-jade-300">
                    {formatAmount(m.s.amount)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Feature bento */}
      <section className="bg-surface-2/50 py-20">
        <div className="mx-auto max-w-content px-4 md:px-8">
          <h2 className="text-center font-display text-3xl font-bold md:text-4xl">Everything in one place</h2>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              { icon: Search, title: 'Smart Match', desc: 'Scores every scholarship against your profile with one-line reasons.' },
              { icon: ShieldCheck, title: 'Eligibility Explained', desc: 'Plain-language criteria with fix hints for gaps.' },
              { icon: Target, title: 'Kanban Tracker', desc: 'Drag-and-drop board from saved to awarded with full history.' },
              { icon: Calendar, title: 'Calendar', desc: 'See all deadlines, openings, and reminders in one view.' },
              { icon: FolderOpen, title: 'Document Vault', desc: 'Securely store documents once, reuse across applications.' },
              { icon: PenLine, title: 'Essay Studio', desc: 'Write with a built-in coach, version history, and word limits.' },
              { icon: Wallet, title: 'Funding Planner', desc: 'Turn scholarships into an expected-value plan against your cost gap.' },
              { icon: BarChart3, title: 'Insights', desc: 'Track success rates, funding trends, and deadline density.' },
              { icon: BookOpen, title: 'Learn', desc: 'Articles and a glossary to guide you through every step.' },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 3) * 0.08 }}
              >
                <Card className={cn('h-full', f.title === 'Smart Match' && 'md:col-span-1')}>
                  <f.icon className="h-6 w-6 text-jade-600 dark:text-jade-400" />
                  <h3 className="mt-3 font-display text-base font-semibold">{f.title}</h3>
                  <p className="mt-1 text-sm text-ink-muted">{f.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Learn section */}
      <section id="learn" className="py-20">
        <div className="mx-auto max-w-content px-4 md:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold md:text-4xl">Learn the ropes</h2>
              <p className="mt-2 text-ink-muted">Guides on essays, deadlines, and funding strategy.</p>
            </div>
            <Button variant="ghost" onClick={() => navigate('/app/learn')} className="hidden sm:flex">
              Browse all <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { icon: PenLine, title: 'Writing a Winning Essay', desc: 'Hook reviewers in the first sentence and show, not tell.' },
              { icon: Calendar, title: 'Managing Multiple Deadlines', desc: 'The 7-3-1 rule and working backwards from the deadline.' },
              { icon: Wallet, title: 'The Funding Gap', desc: 'Calculate your gap and prioritise by expected value.' },
            ].map((l) => (
              <Card key={l.title} className="h-full">
                <l.icon className="h-6 w-6 text-gold-500" />
                <h3 className="mt-3 font-display text-base font-semibold">{l.title}</h3>
                <p className="mt-1 text-sm text-ink-muted">{l.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-surface-2/50 py-20">
        <div className="mx-auto max-w-2xl px-4 md:px-8">
          <h2 className="text-center font-display text-3xl font-bold md:text-4xl">FAQ</h2>
          <Accordion type="single" collapsible className="mt-8 space-y-3">
            {FAQS.map((f) => (
              <AccordionItem key={f.q}>
                <AccordionTrigger>{f.q}</AccordionTrigger>
                <AccordionContent>{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden py-20 grain-overlay">
        <div className="absolute inset-0 -z-10 bg-jade-900" />
        <div className="absolute inset-0 -z-10" style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 100%, rgb(245 184 61 / 0.15), transparent)' }} />
        <div className="mx-auto max-w-2xl px-4 text-center md:px-8">
          <GraduationCap className="mx-auto h-12 w-12 text-gold-400" />
          <h2 className="mt-4 text-balance font-display text-3xl font-bold text-paper md:text-4xl">
            Your scholarship journey starts here
          </h2>
          <p className="mt-3 text-jade-100">
            Onboard in 5 minutes, get matched in seconds, track everything in one place.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button variant="cta" size="lg" onClick={start}>
              Get started <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="border-jade-700 bg-jade-800 text-paper hover:bg-jade-700"
              onClick={() => { loadDemo(); setTimeout(() => navigate('/app/dashboard'), 600) }}
            >
              Explore demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface py-8">
        <div className="mx-auto max-w-content px-4 md:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-jade-600">
                <GraduationCap className="h-4 w-4 text-gold-400" />
              </span>
              <span className="font-display text-lg font-bold">Grantly</span>
            </div>
            <p className="text-xs text-ink-subtle">
              Demo data: fictional programs for illustration. Always verify with the official provider.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
