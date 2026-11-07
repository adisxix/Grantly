import { MATCH_WEIGHTS, VERDICT_THRESHOLDS } from './weights'
import { isPastDeadline, daysBetween } from '@/lib/utils'

/**
 * @typedef {import('@/data/models').StudentProfile} StudentProfile
 * @typedef {import('@/data/models').Scholarship} Scholarship
 * @typedef {import('@/data/models').CriterionResult} CriterionResult
 * @typedef {import('@/data/models').MatchResult} MatchResult
 */

/** @type {Record<string, (p: StudentProfile, s: Scholarship) => CriterionResult>} */
const hardFilters = {
  educationLevel: (p, s) => {
    const ok = s.levels.includes(p.educationLevel)
    return {
      key: 'educationLevel',
      label: 'Education level',
      status: ok ? 'met' : 'unmet',
      weight: 0,
      text: ok
        ? `Your level (${p.educationLevel}) is accepted.`
        : `This requires ${s.levels.join(', ')}. You selected ${p.educationLevel}.`,
      fix: ok ? undefined : 'This scholarship does not support your education level.',
    }
  },
  country: (p, s) => {
    const ok = s.countries.includes(p.country)
    return {
      key: 'country',
      label: 'Country',
      status: ok ? 'met' : 'unmet',
      weight: 0,
      text: ok
        ? `Open to students in ${p.country}.`
        : `Only for ${s.countries.join(', ')}. You are in ${p.country}.`,
      fix: ok ? undefined : 'This scholarship is not available in your country.',
    }
  },
  deadline: (_p, s) => {
    const past = isPastDeadline(s.deadline)
    return {
      key: 'deadline',
      label: 'Application open',
      status: past ? 'unmet' : 'met',
      weight: 0,
      text: past
        ? `The deadline has passed (${daysBetween(Date.now(), s.deadline)} days ago).`
        : `Application is open. Deadline in ${daysBetween(Date.now(), s.deadline)} days.`,
      fix: past ? 'Applications are closed for this cycle.' : undefined,
    }
  },
  disability: (p, s) => {
    if (!s.requiresDisability) return null
    const ok = p.hasDisability === true
    return {
      key: 'disability',
      label: 'Disability requirement',
      status: ok ? 'met' : 'unmet',
      weight: 0,
      text: ok
        ? 'You meet the disability requirement.'
        : 'This scholarship is specifically for students with disabilities.',
      fix: ok ? undefined : 'A valid disability certificate is required to apply.',
    }
  },
  gender: (p, s) => {
    if (!s.genders || s.genders.length === 0) return null
    const ok = s.genders.includes(p.gender)
    return {
      key: 'gender',
      label: 'Gender eligibility',
      status: ok ? 'met' : 'unmet',
      weight: 0,
      text: ok
        ? `You are eligible (${p.gender}).`
        : `Restricted to ${s.genders.join(', ')}.`,
      fix: ok ? undefined : 'This scholarship is restricted by gender.',
    }
  },
  income: (p, s) => {
    if (!s.maxFamilyIncomeINR) return null
    const ok = p.familyIncomeINR <= s.maxFamilyIncomeINR
    return {
      key: 'income',
      label: 'Family income',
      status: ok ? 'met' : 'unmet',
      weight: 0,
      text: ok
        ? `Your family income (₹${(p.familyIncomeINR / 100000).toFixed(1)}L) is under the ₹${(s.maxFamilyIncomeINR / 100000).toFixed(0)}L limit.`
        : `Your family income (₹${(p.familyIncomeINR / 100000).toFixed(1)}L) exceeds the ₹${(s.maxFamilyIncomeINR / 100000).toFixed(0)}L limit.`,
      fix: ok ? undefined : 'Your family income exceeds the maximum allowed.',
    }
  },
  gpa: (p, s) => {
    if (!s.minGpaPercent) return null
    if (!p.gpaPercent) return null // missing GPA is not a hard fail
    const gap = p.gpaPercent - s.minGpaPercent
    if (gap >= 0) {
      return {
        key: 'gpa',
        label: 'Academic score',
        status: 'met',
        weight: 0,
        text: `Your score (${p.gpaPercent}%) meets the ${s.minGpaPercent}% minimum.`,
      }
    }
    // Hard fail if more than 10 points below
    if (gap < -10) {
      return {
        key: 'gpa',
        label: 'Academic score',
        status: 'unmet',
        weight: 0,
        text: `Your score (${p.gpaPercent}%) is well below the ${s.minGpaPercent}% minimum.`,
        fix: 'Your score is more than 10% below the minimum required.',
      }
    }
    return null // close enough — treat as soft below
  },
}

/** @type {Record<string, (p: StudentProfile, s: Scholarship) => CriterionResult>} */
const softCriteria = {
  level: (p, s) => {
    const ok = s.levels.includes(p.educationLevel)
    return {
      key: 'level',
      label: 'Education level fit',
      status: ok ? 'met' : 'unmet',
      weight: MATCH_WEIGHTS.level,
      text: ok
        ? `${p.educationLevel} is a direct match.`
        : `Prefers ${s.levels.join(', ')}; you are ${p.educationLevel}.`,
      fix: ok ? undefined : 'A different education level is preferred.',
    }
  },
  field: (p, s) => {
    if (s.fields.includes('Any')) {
      return { key: 'field', label: 'Field of study', status: 'met', weight: MATCH_WEIGHTS.field, text: 'Open to all fields.' }
    }
    const ok = s.fields.includes(p.fieldOfStudy)
    const partial = s.fields.some((f) =>
      p.fieldOfStudy.toLowerCase().includes(f.toLowerCase()) || f.toLowerCase().includes(p.fieldOfStudy.toLowerCase()),
    )
    return {
      key: 'field',
      label: 'Field of study',
      status: ok ? 'met' : partial ? 'partial' : 'unmet',
      weight: MATCH_WEIGHTS.field,
      text: ok
        ? `${p.fieldOfStudy} is a direct match.`
        : partial
          ? `${p.fieldOfStudy} partially matches ${s.fields.join(', ')}.`
          : `Prefers ${s.fields.join(', ')}; you study ${p.fieldOfStudy}.`,
      fix: ok || partial ? undefined : 'A different field is preferred.',
    }
  },
  academics: (p, s) => {
    if (!s.minGpaPercent) {
      return { key: 'academics', label: 'Academic score', status: 'unknown', weight: MATCH_WEIGHTS.academics, text: 'No minimum score specified.' }
    }
    if (!p.gpaPercent) {
      return { key: 'academics', label: 'Academic score', status: 'unknown', weight: MATCH_WEIGHTS.academics, text: 'Add your GPA to see academic fit.', fix: 'Complete your profile to get an academic match.' }
    }
    const gap = p.gpaPercent - s.minGpaPercent
    if (gap >= 5) return { key: 'academics', label: 'Academic score', status: 'met', weight: MATCH_WEIGHTS.academics, text: `Your score (${p.gpaPercent}%) comfortably exceeds the ${s.minGpaPercent}% minimum.` }
    if (gap >= 0) return { key: 'academics', label: 'Academic score', status: 'met', weight: MATCH_WEIGHTS.academics, text: `Your score (${p.gpaPercent}%) meets the ${s.minGpaPercent}% minimum.` }
    if (gap >= -10) {
      const ratio = (10 + gap) / 10
      return { key: 'academics', label: 'Academic score', status: 'partial', weight: MATCH_WEIGHTS.academics * ratio * 0.4, text: `Your score (${p.gpaPercent}%) is ${Math.abs(gap)}% below the ${s.minGpaPercent}% minimum.`, fix: 'Aim to improve your score or highlight other strengths.' }
    }
    return { key: 'academics', label: 'Academic score', status: 'unmet', weight: 0, text: `Your score (${p.gpaPercent}%) is below the ${s.minGpaPercent}% minimum.`, fix: 'Your score is below the minimum.' }
  },
  financialNeed: (p, s) => {
    if (!s.maxFamilyIncomeINR) {
      return { key: 'financialNeed', label: 'Financial need', status: 'unknown', weight: MATCH_WEIGHTS.financialNeed, text: 'No income limit specified.' }
    }
    if (!p.familyIncomeINR) {
      return { key: 'financialNeed', label: 'Financial need', status: 'unknown', weight: MATCH_WEIGHTS.financialNeed, text: 'Add your family income to check eligibility.', fix: 'Complete your profile income field.' }
    }
    const ratio = p.familyIncomeINR / s.maxFamilyIncomeINR
    if (ratio <= 1) {
      const quality = ratio <= 0.5 ? 'comfortably' : 'just'
      return { key: 'financialNeed', label: 'Financial need', status: 'met', weight: MATCH_WEIGHTS.financialNeed, text: `Your income ${quality} qualifies under the ₹${(s.maxFamilyIncomeINR / 100000).toFixed(0)}L limit.` }
    }
    return { key: 'financialNeed', label: 'Financial need', status: 'unmet', weight: 0, text: `Income exceeds the ₹${(s.maxFamilyIncomeINR / 100000).toFixed(0)}L limit.`, fix: 'Your income is above the ceiling.' }
  },
  geography: (p, s) => {
    const countryOk = s.countries.includes(p.country)
    const stateOk = !s.states || s.states.length === 0 || s.states.includes(p.state)
    if (countryOk && stateOk) return { key: 'geography', label: 'Location', status: 'met', weight: MATCH_WEIGHTS.geography, text: `Available in ${p.country}${p.state ? ', ' + p.state : ''}.` }
    if (countryOk) return { key: 'geography', label: 'Location', status: 'partial', weight: MATCH_WEIGHTS.geography * 0.5, text: `Available in ${p.country} but may restrict to specific states.`, fix: 'Check if your state is eligible.' }
    return { key: 'geography', label: 'Location', status: 'unmet', weight: 0, text: `Not available in ${p.country}.`, fix: 'Not available in your country.' }
  },
  demographics: (p, s) => {
    let pts = 0
    const parts = []
    if (s.categories && s.categories.length > 0) {
      if (s.categories.includes(p.category)) { pts += 0.5; parts.push('category matches') }
      else parts.push('category may not match')
    } else { pts += 0.5 }
    if (s.genders && s.genders.length > 0) {
      if (s.genders.includes(p.gender)) { pts += 0.3; parts.push('gender eligible') }
    } else { pts += 0.3 }
    if (s.types.includes('first_gen') && p.firstGen) { pts += 0.2; parts.push('first-generation bonus') }
    else if (!s.types.includes('first_gen')) pts += 0.1
    pts = Math.min(1, pts)
    return {
      key: 'demographics',
      label: 'Demographics',
      status: pts >= 0.7 ? 'met' : pts >= 0.4 ? 'partial' : 'unmet',
      weight: MATCH_WEIGHTS.demographics * pts,
      text: parts.join('; ') + '.',
      fix: pts < 0.4 ? 'Some demographic criteria may not align.' : undefined,
    }
  },
  interests: (p, s) => {
    if (!p.interests || p.interests.length === 0) {
      return { key: 'interests', label: 'Interests', status: 'unknown', weight: MATCH_WEIGHTS.interests, text: 'Add interests for better tag matching.', fix: 'Add your interests in onboarding.' }
    }
    const overlap = s.tags.filter((t) => p.interests.some((i) => t.toLowerCase().includes(i.toLowerCase()) || i.toLowerCase().includes(t.toLowerCase())))
    const ratio = overlap.length / Math.min(3, s.tags.length)
    return {
      key: 'interests',
      label: 'Interests & tags',
      status: ratio > 0 ? 'met' : 'unmet',
      weight: MATCH_WEIGHTS.interests * Math.max(0.3, ratio),
      text: ratio > 0 ? `Shares ${overlap.length} tag${overlap.length > 1 ? 's' : ''} with your interests.` : 'No tag overlap with your interests.',
      fix: ratio === 0 ? 'No shared interests, but still worth applying.' : undefined,
    }
  },
}

const cache = new WeakMap()

/**
 * Compute a match result for a profile against a scholarship.
 * @param {StudentProfile} profile
 * @param {Scholarship} scholarship
 * @returns {MatchResult}
 */
export function computeMatch(profile, scholarship) {
  if (!profile || !scholarship) {
    return { score: 0, verdict: 'ineligible', criteria: [], reasons: [], gaps: [] }
  }

  // memoise by scholarship object reference within a profile-keyed map
  let profileCache = cache.get(profile)
  if (!profileCache) { profileCache = new Map(); cache.set(profile, profileCache) }
  if (profileCache.has(scholarship)) return profileCache.get(scholarship)

  const criteria = []
  let hardFailed = false

  // Hard filters
  for (const fn of Object.values(hardFilters)) {
    const res = fn(profile, scholarship)
    if (!res) continue
    criteria.push(res)
    if (res.status === 'unmet') hardFailed = true
  }

  // Soft criteria
  let softScore = 0
  let maxSoft = 0
  for (const fn of Object.values(softCriteria)) {
    const res = fn(profile, scholarship)
    if (!res) continue
    criteria.push(res)
    maxSoft += res.weight > 0 ? MATCH_WEIGHTS[res.key] || res.weight : 0
    // For unknown, give partial credit
    if (res.status === 'unknown') softScore += res.weight * 0.5
    else softScore += res.weight
  }

  // Normalise soft score to 0-100
  const softPercent = maxSoft > 0 ? Math.min(100, (softScore / maxSoft) * 100) : softScore
  let score = hardFailed ? Math.min(30, softPercent * 0.3) : softPercent
  score = Math.round(Math.max(0, Math.min(100, score)))

  let verdict
  if (hardFailed) verdict = 'ineligible'
  else if (score >= VERDICT_THRESHOLDS.eligible) verdict = 'eligible'
  else if (score >= VERDICT_THRESHOLDS.partial) verdict = 'partial'
  else verdict = 'ineligible'

  const reasons = criteria
    .filter((c) => c.status === 'met' || c.status === 'partial')
    .slice(0, 3)
    .map((c) => c.text)

  const gaps = criteria
    .filter((c) => c.status === 'unmet' || c.status === 'unknown')
    .map((c) => c.fix || c.text)
    .filter(Boolean)

  const result = { score, verdict, criteria, reasons, gaps }
  profileCache.set(scholarship, result)
  return result
}

/**
 * Compute the readiness score for an application.
 * 40% checklist, 30% documents, 20% essays, 10% time buffer.
 * @param {import('@/data/models').Application} app
 * @param {Scholarship} scholarship
 * @returns {number}
 */
export function readinessScore(app, scholarship) {
  if (!app || !scholarship) return 0
  const checklistDone = app.checklist.filter((c) => c.done).length
  const checklistTotal = app.checklist.length || 1
  const checklistPct = (checklistDone / checklistTotal) * 40

  const docRequired = scholarship.documentsRequired.length
  const docAttached = app.documentIds.length
  const docPct = docRequired > 0 ? Math.min(1, docAttached / docRequired) * 30 : 30

  const essayRequired = (scholarship.essayPrompts || []).length
  const essayAttached = app.essayIds.length
  const essayPct = essayRequired > 0 ? Math.min(1, essayAttached / essayRequired) * 20 : 20

  const daysLeft = daysBetween(Date.now(), scholarship.deadline)
  let timePct
  if (daysLeft < 0) timePct = 0
  else if (daysLeft <= 7) timePct = (daysLeft / 7) * 5
  else if (daysLeft <= 21) timePct = 5 + ((daysLeft - 7) / 14) * 5
  else timePct = 10

  return Math.round(checklistPct + docPct + essayPct + timePct)
}

/**
 * Compute profile completeness as a percentage.
 * @param {StudentProfile} profile
 * @returns {number}
 */
export function profileStrength(profile) {
  if (!profile) return 0
  const fields = [
    'fullName', 'dob', 'gender', 'country', 'state', 'educationLevel',
    'fieldOfStudy', 'institution', 'gpaPercent', 'familyIncomeINR', 'category',
    'interests', 'goals',
  ]
  const filled = fields.filter((f) => {
    const v = profile[f]
    if (Array.isArray(v)) return v.length > 0
    return v != null && v !== '' && v !== 0
  })
  return Math.round((filled.length / fields.length) * 100)
}

/**
 * Value per hour of applying — used to rank what to apply to first.
 * @param {Scholarship} scholarship
 * @param {number} matchScore
 * @returns {number}
 */
export function valuePerHour(scholarship, matchScore) {
  if (!scholarship) return 0
  const expectedAmount = ((scholarship.amount.min + scholarship.amount.max) / 2) * (matchScore / 100)
  const hours = Math.max(0.5, scholarship.estimatedMinutes / 60)
  return expectedAmount / hours
}

/**
 * Get the colour tier for a match score.
 * @param {number} score
 * @param {string} [verdict]
 * @returns {'excellent'|'good'|'partial'|'ineligible'}
 */
export function matchColour(score, verdict) {
  if (verdict === 'ineligible' && score < 50) return 'ineligible'
  if (score >= 85) return 'excellent'
  if (score >= 65) return 'good'
  return 'partial'
}
