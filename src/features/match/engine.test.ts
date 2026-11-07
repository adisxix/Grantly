import { describe, it, expect } from 'vitest'
import { computeMatch, readinessScore, profileStrength, valuePerHour, matchColour } from './engine'

const baseProfile = {
  id: 'p1', fullName: 'Aanya', dob: '2005-01-01', gender: 'female',
  country: 'India', state: 'Karnataka', educationLevel: 'undergraduate',
  fieldOfStudy: 'Engineering', institution: 'IIT', yearOfStudy: 2,
  gpaPercent: 82, familyIncomeINR: 420000, category: 'General',
  firstGen: false, hasDisability: false, interests: ['stem', 'coding'], goals: 'Engineer',
  onboardingComplete: true, createdAt: new Date().toISOString(),
}

const baseScholarship = {
  id: 's-test', slug: 'test', name: 'Test Scholarship', provider: 'Test',
  providerType: 'foundation', description: 'desc', tags: ['stem'],
  amount: { min: 25000, max: 100000, currency: 'INR', cadence: 'annual', renewable: true },
  opensOn: new Date().toISOString(), deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
  types: ['merit'], levels: ['undergraduate'], fields: ['Engineering'],
  countries: ['India'], minGpaPercent: 75, maxFamilyIncomeINR: 600000,
  documentsRequired: ['transcript', 'id_proof'], steps: [], faqs: [],
  difficulty: 'moderate', estimatedMinutes: 60, awardsCount: 100, website: 'x',
}

function makeScholarship(overrides) {
  return { ...baseScholarship, ...overrides }
}

describe('computeMatch', () => {
  it('returns eligible with high score for a perfect fit', () => {
    const r = computeMatch(baseProfile, baseScholarship)
    expect(r.verdict).toBe('eligible')
    expect(r.score).toBeGreaterThanOrEqual(85)
  })

  it('returns ineligible when education level does not match', () => {
    const s = makeScholarship({ levels: ['postgraduate'] })
    const r = computeMatch(baseProfile, s)
    expect(r.verdict).toBe('ineligible')
    expect(r.score).toBeLessThanOrEqual(30)
  })

  it('returns ineligible when country does not match', () => {
    const s = makeScholarship({ countries: ['USA'] })
    const r = computeMatch(baseProfile, s)
    expect(r.verdict).toBe('ineligible')
  })

  it('returns ineligible when deadline has passed', () => {
    const s = makeScholarship({ deadline: new Date(Date.now() - 86400000).toISOString() })
    const r = computeMatch(baseProfile, s)
    expect(r.verdict).toBe('ineligible')
  })

  it('returns ineligible when income exceeds the ceiling', () => {
    const s = makeScholarship({ maxFamilyIncomeINR: 300000 })
    const r = computeMatch(baseProfile, s)
    expect(r.verdict).toBe('ineligible')
  })

  it('returns ineligible when disability is required but not met', () => {
    const s = makeScholarship({ requiresDisability: true })
    const r = computeMatch(baseProfile, s)
    expect(r.verdict).toBe('ineligible')
  })

  it('returns ineligible when gender restriction not met', () => {
    const s = makeScholarship({ genders: ['male'] })
    const r = computeMatch(baseProfile, s)
    expect(r.verdict).toBe('ineligible')
  })

  it('caps at 30 when GPA is more than 10 points below minimum', () => {
    const s = makeScholarship({ minGpaPercent: 95 })
    const p = { ...baseProfile, gpaPercent: 82 }
    const r = computeMatch(p, s)
    expect(r.score).toBeLessThanOrEqual(30)
    expect(r.verdict).toBe('ineligible')
  })

  it('gives partial when GPA is slightly below minimum', () => {
    const s = makeScholarship({ minGpaPercent: 84 })
    const p = { ...baseProfile, gpaPercent: 80 }
    const r = computeMatch(p, s)
    expect(r.score).toBeLessThan(85)
  })

  it('treats "Any" field as a met criterion', () => {
    const s = makeScholarship({ fields: ['Any'] })
    const r = computeMatch(baseProfile, s)
    const fieldCrit = r.criteria.find((c) => c.key === 'field')
    expect(fieldCrit.status).toBe('met')
  })

  it('produces reasons and gaps arrays', () => {
    const r = computeMatch(baseProfile, baseScholarship)
    expect(Array.isArray(r.reasons)).toBe(true)
    expect(r.reasons.length).toBeGreaterThan(0)
    expect(Array.isArray(r.gaps)).toBe(true)
  })

  it('handles missing profile data as unknown', () => {
    const p = { ...baseProfile, gpaPercent: 0 }
    const s = makeScholarship({ minGpaPercent: 75 })
    const r = computeMatch(p, s)
    const acad = r.criteria.find((c) => c.key === 'academics')
    expect(acad.status).toBe('unknown')
  })

  it('returns zero for null inputs', () => {
    expect(computeMatch(null, baseScholarship).score).toBe(0)
    expect(computeMatch(baseProfile, null).score).toBe(0)
  })

  it('memoises results (same object reference returns same result)', () => {
    const r1 = computeMatch(baseProfile, baseScholarship)
    const r2 = computeMatch(baseProfile, baseScholarship)
    expect(r1).toBe(r2)
  })
})

describe('readinessScore', () => {
  const app = {
    id: 'a1', scholarshipId: 's-test', status: 'preparing', notes: '',
    checklist: [{ id: 'c1', label: 'Upload transcript', done: true }, { id: 'c2', label: 'Write essay', done: false }],
    documentIds: ['d1'], essayIds: [], reminders: [7, 3, 1], updatedAt: new Date().toISOString(), activity: [],
  }
  it('returns a number 0-100', () => {
    const s = readinessScore(app, baseScholarship)
    expect(s).toBeGreaterThanOrEqual(0)
    expect(s).toBeLessThanOrEqual(100)
  })
  it('returns 0 for null inputs', () => {
    expect(readinessScore(null, baseScholarship)).toBe(0)
  })
})

describe('profileStrength', () => {
  it('returns 100 for a fully filled profile', () => {
    expect(profileStrength(baseProfile)).toBe(100)
  })
  it('returns lower for incomplete profile', () => {
    const p = { ...baseProfile, goals: '', interests: [] }
    expect(profileStrength(p)).toBeLessThan(100)
  })
  it('returns 0 for null', () => {
    expect(profileStrength(null)).toBe(0)
  })
})

describe('valuePerHour', () => {
  it('computes expected value per hour', () => {
    const v = valuePerHour(baseScholarship, 100)
    const expectedAmount = 62500
    expect(v).toBeCloseTo(expectedAmount / 1, 1)
  })
  it('returns 0 for null scholarship', () => {
    expect(valuePerHour(null, 80)).toBe(0)
  })
})

describe('matchColour', () => {
  it('returns excellent for 85+', () => {
    expect(matchColour(90)).toBe('excellent')
  })
  it('returns good for 65-84', () => {
    expect(matchColour(70)).toBe('good')
  })
  it('returns partial for below 65', () => {
    expect(matchColour(50)).toBe('partial')
  })
  it('returns ineligible for low score with ineligible verdict', () => {
    expect(matchColour(20, 'ineligible')).toBe('ineligible')
  })
})
