import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { z } from 'zod'
import { Loader2, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Textarea, Label, FieldError } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Stepper } from '@/components/ui/stepper'
import { Checkbox } from '@/components/ui/checkbox'
import { useProfileStore } from '@/store/useProfileStore'
import { useNotificationStore } from '@/store/useNotificationStore'
import { EDUCATION_LEVELS, EDUCATION_LABELS, FIELDS_OF_STUDY, GENDERS, COUNTRIES, INDIAN_STATES, CATEGORIES } from '@/data/constants'
import { SCHOLARSHIPS } from '@/data/scholarships'
import { computeMatch } from '@/features/match/engine'
import { loadDemo } from '@/features/demo/loadDemo'
import { cn } from '@/lib/utils'

const STEPS = ['About you', 'Education', 'Background', 'Interests', 'Review']

const schemas = [
  z.object({
    fullName: z.string().min(2, 'Enter your name'),
    dob: z.string().min(1, 'Select your date of birth'),
    gender: z.string().min(1, 'Select your gender'),
    country: z.string().min(1, 'Select your country'),
    state: z.string().optional(),
  }),
  z.object({
    educationLevel: z.string().min(1, 'Select your level'),
    fieldOfStudy: z.string().min(1, 'Select your field'),
    institution: z.string().min(2, 'Enter your institution'),
    yearOfStudy: z.number().min(1).max(8),
    gpaPercent: z.number().min(0).max(100),
  }),
  z.object({
    familyIncomeINR: z.number().min(0),
    category: z.string().min(1, 'Select your category'),
    firstGen: z.boolean(),
    hasDisability: z.boolean(),
  }),
  z.object({
    interests: z.array(z.string()),
    goals: z.string().optional(),
  }),
]

const INTEREST_OPTIONS = [
  'stem', 'coding', 'research', 'sustainability', 'entrepreneurship',
  'social impact', 'arts', 'design', 'sports', 'writing', 'public speaking',
  'data science', 'robotics', 'healthcare',
]

export default function Onboarding() {
  const navigate = useNavigate()
  const setProfile = useProfileStore((s) => s.setProfile)
  const completeOnboarding = useProfileStore((s) => s.completeOnboarding)
  const addNotification = useNotificationStore((s) => s.addNotification)
  const [step, setStep] = useState(0)
  const [data, setData] = useState({
    fullName: '', dob: '', gender: 'female', country: 'India', state: 'Karnataka',
    educationLevel: 'undergraduate', fieldOfStudy: 'Engineering', institution: '',
    yearOfStudy: 2, gpaPercent: 75, familyIncomeINR: 500000, category: 'General',
    firstGen: false, hasDisability: false, interests: [], goals: '',
  })
  const [errors, setErrors] = useState({})
  const [finding, setFinding] = useState(false)
  const [matchCount, setMatchCount] = useState(0)

  function validate() {
    try {
      schemas[step].parse(data)
      setErrors({})
      return true
    } catch (e) {
      const errs = {}
      e.errors?.forEach((err) => {
        if (err.path?.[0]) errs[err.path[0]] = err.message
      })
      setErrors(errs)
      return false
    }
  }

  function next() {
    if (!validate()) return
    if (step < STEPS.length - 1) setStep(step + 1)
    else finish()
  }

  function back() {
    if (step > 0) setStep(step - 1)
  }

  function finish() {
    setFinding(true)
    // Simulate matching animation
    setTimeout(() => {
      const profile = { ...data, onboardingComplete: false, createdAt: new Date().toISOString() }
      setProfile(profile)
      const matches = SCHOLARSHIPS.filter((s) => {
        const m = computeMatch({ ...profile, id: 'tmp' }, s)
        return m.verdict !== 'ineligible'
      })
      setMatchCount(matches.length)
      setTimeout(() => {
        completeOnboarding()
        addNotification({
          kind: 'system',
          title: 'Welcome to Grantly!',
          body: `We found ${matches.length} scholarships you can apply to.`,
        })
        navigate('/app/dashboard')
      }, 1200)
    }, 1500)
  }

  function toggleInterest(i) {
    setData((d) => ({
      ...d,
      interests: d.interests.includes(i)
        ? d.interests.filter((x) => x !== i)
        : [...d.interests, i],
    }))
  }

  if (finding) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-paper px-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-jade-600">
          <Sparkles className="h-8 w-8 animate-pulse text-gold-400" />
        </span>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <h2 className="font-display text-2xl font-semibold">
            {matchCount > 0 ? `Found ${matchCount} matches!` : 'Finding your matches…'}
          </h2>
          <p className="mt-2 text-sm text-ink-muted">
            {matchCount > 0 ? 'Taking you to your dashboard…' : 'Scanning 40 scholarships against your profile.'}
          </p>
        </motion.div>
        {matchCount === 0 && <Loader2 className="h-6 w-6 animate-spin text-jade-600" />}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-between">
          <span className="font-display text-xl font-bold">Grantly</span>
          <button
            onClick={() => { loadDemo(); navigate('/app/dashboard') }}
            className="text-sm text-jade-600 dark:text-jade-400 hover:underline"
          >
            Skip and use demo profile
          </button>
        </div>

        {/* Stepper */}
        <Stepper steps={STEPS} current={step} className="mb-8" />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="card-base rounded-lg p-6"
          >
            {/* Step 1: About you */}
            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-display text-xl font-semibold">About you</h2>
                  <p className="text-sm text-ink-muted">Let's start with the basics.</p>
                </div>
                <div>
                  <Label htmlFor="fullName">Full name</Label>
                  <Input id="fullName" value={data.fullName} onChange={(e) => setData({ ...data, fullName: e.target.value })} placeholder="Aanya Sharma" />
                  {errors.fullName && <FieldError>{errors.fullName}</FieldError>}
                </div>
                <div>
                  <Label htmlFor="dob">Date of birth</Label>
                  <Input id="dob" type="date" value={data.dob} onChange={(e) => setData({ ...data, dob: e.target.value })} />
                  {errors.dob && <FieldError>{errors.dob}</FieldError>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={data.gender} onValueChange={(v) => setData({ ...data, gender: v })}>
                      <SelectTrigger id="gender"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {GENDERS.map((g) => (
                          <SelectItem key={g} value={g} className="capitalize">{g}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Select value={data.country} onValueChange={(v) => setData({ ...data, country: v })}>
                      <SelectTrigger id="country"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {data.country === 'India' && (
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Select value={data.state} onValueChange={(v) => setData({ ...data, state: v })}>
                      <SelectTrigger id="state"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {INDIAN_STATES.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Education */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-display text-xl font-semibold">Your education</h2>
                  <p className="text-sm text-ink-muted">Help us match you to the right level.</p>
                </div>
                <div>
                  <Label htmlFor="level">Education level</Label>
                  <Select value={data.educationLevel} onValueChange={(v) => setData({ ...data, educationLevel: v })}>
                    <SelectTrigger id="level"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {EDUCATION_LEVELS.map((l) => (
                        <SelectItem key={l} value={l}>{EDUCATION_LABELS[l]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="field">Field of study</Label>
                  <Select value={data.fieldOfStudy} onValueChange={(v) => setData({ ...data, fieldOfStudy: v })}>
                    <SelectTrigger id="field"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FIELDS_OF_STUDY.map((f) => (
                        <SelectItem key={f} value={f}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="institution">Institution</Label>
                  <Input id="institution" value={data.institution} onChange={(e) => setData({ ...data, institution: e.target.value })} placeholder="National Institute of Technology" />
                  {errors.institution && <FieldError>{errors.institution}</FieldError>}
                </div>
                <div>
                  <Label htmlFor="year">Year of study</Label>
                  <Select value={String(data.yearOfStudy)} onValueChange={(v) => setData({ ...data, yearOfStudy: Number(v) })}>
                    <SelectTrigger id="year"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((y) => (
                        <SelectItem key={y} value={String(y)}>Year {y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Academic score (GPA %): {data.gpaPercent}%</Label>
                  <div className="flex items-center gap-3">
                    <Slider value={[data.gpaPercent]} onValueChange={([v]) => setData({ ...data, gpaPercent: v })} min={0} max={100} step={1} className="flex-1" />
                    <Input type="number" value={data.gpaPercent} onChange={(e) => setData({ ...data, gpaPercent: Number(e.target.value) })} className="w-20" min={0} max={100} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Background */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-display text-xl font-semibold">Your background</h2>
                  <p className="text-sm text-ink-muted">
                    This unlocks need-based scholarships. Everything stays on this device.
                  </p>
                </div>
                <div>
                  <Label>Family annual income: ₹{(data.familyIncomeINR / 100000).toFixed(1)}L</Label>
                  <Slider value={[data.familyIncomeINR]} onValueChange={([v]) => setData({ ...data, familyIncomeINR: v })} min={0} max={2000000} step={50000} />
                  <p className="mt-1 text-xs text-ink-subtle">Used to check income-based eligibility. Never leaves your device.</p>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={data.category} onValueChange={(v) => setData({ ...data, category: v })}>
                    <SelectTrigger id="category"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <label className="flex cursor-pointer items-center gap-3 rounded-md border border-border p-3 hover:bg-surface-2">
                  <Checkbox checked={data.firstGen} onCheckedChange={(v) => setData({ ...data, firstGen: !!v })} />
                  <span className="text-sm">
                    First-generation college student
                    <span className="block text-xs text-ink-subtle">Neither parent completed a bachelor's degree</span>
                  </span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-md border border-border p-3 hover:bg-surface-2">
                  <Checkbox checked={data.hasDisability} onCheckedChange={(v) => setData({ ...data, hasDisability: !!v })} />
                  <span className="text-sm">
                    I have a disability
                    <span className="block text-xs text-ink-subtle">Unlocks disability-specific scholarships</span>
                  </span>
                </label>
              </div>
            )}

            {/* Step 4: Interests */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-display text-xl font-semibold">Your interests & goals</h2>
                  <p className="text-sm text-ink-muted">For better tag-based matching.</p>
                </div>
                <div>
                  <Label>Interests (select any that apply)</Label>
                  <div className="flex flex-wrap gap-2">
                    {INTEREST_OPTIONS.map((i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggleInterest(i)}
                        className={cn(
                          'rounded-full border px-3 py-1.5 text-sm capitalize transition-colors',
                          data.interests.includes(i)
                            ? 'border-jade-600 bg-jade-50 text-jade-700 dark:bg-jade-900/30 dark:text-jade-300'
                            : 'border-border bg-surface text-ink-muted hover:bg-surface-2',
                        )}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="goals">Goals (optional)</Label>
                  <Textarea id="goals" value={data.goals} onChange={(e) => setData({ ...data, goals: e.target.value })} placeholder="What do you want to achieve with your education?" rows={4} />
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-display text-xl font-semibold">Review your profile</h2>
                  <p className="text-sm text-ink-muted">Make sure everything looks right.</p>
                </div>
                <dl className="divide-y divide-border">
                  {[
                    ['Name', data.fullName],
                    ['Education', `${EDUCATION_LABELS[data.educationLevel]}, ${data.fieldOfStudy}`],
                    ['Institution', data.institution],
                    ['Academic score', `${data.gpaPercent}%`],
                    ['Country', `${data.country}${data.state ? ', ' + data.state : ''}`],
                    ['Family income', `₹${(data.familyIncomeINR / 100000).toFixed(1)}L`],
                    ['Category', data.category],
                    ['First-gen', data.firstGen ? 'Yes' : 'No'],
                    ['Interests', data.interests.length ? data.interests.join(', ') : 'None selected'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between py-2 text-sm">
                      <dt className="text-ink-muted">{label}</dt>
                      <dd className="font-medium text-ink">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Nav buttons */}
            <div className="mt-6 flex items-center justify-between">
              {step > 0 ? (
                <Button variant="ghost" onClick={back}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
              ) : (
                <span />
              )}
              <Button onClick={next}>
                {step < STEPS.length - 1 ? (
                  <>Continue <ArrowRight className="h-4 w-4" /></>
                ) : (
                  <>Find my matches <Sparkles className="h-4 w-4" /></>
                )}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
