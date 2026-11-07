import { useState, useMemo, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import Fuse from 'fuse.js'
import { Search, SlidersHorizontal, LayoutGrid, List, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { EmptyState } from '@/components/ui/empty-state'
import { ScholarshipCard } from '@/components/scholarship/ScholarshipCard'
import { CompareTray } from '@/components/scholarship/CompareTray'
import { useProfileStore } from '@/store/useProfileStore'
import { useUIStore } from '@/store/useUIStore'
import { ALL_SCHOLARSHIPS } from '@/data/scholarships'
import { computeMatch } from '@/features/match/engine'
import {
  EDUCATION_LEVELS, EDUCATION_LABELS, FIELDS_OF_STUDY, SCHOLARSHIP_TYPES,
  SCHOLARSHIP_TYPE_LABELS, PROVIDER_TYPES, PROVIDER_LABELS, DIFFICULTY_LEVELS,
  DIFFICULTY_LABELS,
} from '@/data/constants'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/utils'

const QUICK_CHIPS = [
  { key: 'closingSoon', label: 'Closing soon' },
  { key: 'highAmount', label: 'High amount' },
  { key: 'easyApply', label: 'Easy apply' },
  { key: 'noEssay', label: 'No essay' },
  { key: 'renewable', label: 'Renewable' },
  { key: 'myField', label: 'My field' },
]

const SORT_OPTIONS = [
  { value: 'match', label: 'Best match' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'amount', label: 'Amount' },
  { value: 'newest', label: 'Newest' },
]

const BATCH_SIZE = 12

export default function Discover() {
  const profile = useProfileStore((s) => s.profile)
  const addRecentSearch = useUIStore((s) => s.addRecentSearch)
  const recentSearches = useUIStore((s) => s.recentSearches)

  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [debouncedQuery, setDebounced] = useState('')
  const debouncedValue = useDebounce(query, 300)
  const [filters, setFilters] = useState({
    levels: [],
    fields: [],
    types: [],
    providerTypes: [],
    countries: [],
    minAmount: 0,
    maxAmount: 200000,
    deadlineWindow: 'any',
    difficulty: [],
    essayRequired: 'any',
    eligibleOnly: true,
    minMatch: 0,
  })
  const [sort, setSort] = useState('match')
  const [layout, setLayout] = useState('grid')
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    setDebounced(debouncedValue)
    if (debouncedValue) addRecentSearch(debouncedValue)
  }, [debouncedValue, addRecentSearch])

  // Sync query to URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    if (query) params.set('q', query)
    else params.delete('q')
    setSearchParams(params, { replace: true })
    setVisibleCount(BATCH_SIZE)
  }, [query]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fuse search index
  const fuse = useMemo(
    () =>
      new Fuse(ALL_SCHOLARSHIPS, {
        keys: ['name', 'provider', 'tags', 'description'],
        threshold: 0.35,
        includeScore: false,
      }),
    [],
  )

  const filtered = useMemo(() => {
    let results = ALL_SCHOLARSHIPS

    // Search
    if (debouncedQuery.trim()) {
      results = fuse.search(debouncedQuery).map((r) => r.item)
    }

    // Compute match for each
    const scored = results.map((s) => {
      const m = profile ? computeMatch(profile, s) : { score: 50, verdict: 'partial' }
      return { s, m }
    })

    // Eligible only
    let filteredResults = scored
    if (filters.eligibleOnly) {
      filteredResults = filteredResults.filter((x) => x.m.verdict !== 'ineligible')
    }
    if (filters.minMatch > 0) {
      filteredResults = filteredResults.filter((x) => x.m.score >= filters.minMatch)
    }

    // Level filter
    if (filters.levels.length > 0) {
      filteredResults = filteredResults.filter((x) =>
        filters.levels.some((l) => x.s.levels.includes(l)),
      )
    }
    // Field filter
    if (filters.fields.length > 0) {
      filteredResults = filteredResults.filter((x) =>
        filters.fields.some((f) => x.s.fields.includes(f) || x.s.fields.includes('Any')),
      )
    }
    // Type filter
    if (filters.types.length > 0) {
      filteredResults = filteredResults.filter((x) =>
        filters.types.some((t) => x.s.types.includes(t)),
      )
    }
    // Provider type
    if (filters.providerTypes.length > 0) {
      filteredResults = filteredResults.filter((x) =>
        filters.providerTypes.includes(x.s.providerType),
      )
    }
    // Country
    if (filters.countries.length > 0) {
      filteredResults = filteredResults.filter((x) =>
        filters.countries.some((c) => x.s.countries.includes(c)),
      )
    }
    // Amount range
    filteredResults = filteredResults.filter((x) =>
      x.s.amount.max >= filters.minAmount * 1000 && x.s.amount.min <= filters.maxAmount * 1000,
    )
    // Deadline window
    if (filters.deadlineWindow !== 'any') {
      const days = parseInt(filters.deadlineWindow)
      const now = Date.now()
      filteredResults = filteredResults.filter((x) =>
        (new Date(x.s.deadline).getTime() - now) / (1000 * 60 * 60 * 24) <= days,
      )
    }
    // Difficulty
    if (filters.difficulty.length > 0) {
      filteredResults = filteredResults.filter((x) =>
        filters.difficulty.includes(x.s.difficulty),
      )
    }
    // Essay required
    if (filters.essayRequired === 'yes') {
      filteredResults = filteredResults.filter((x) => (x.s.essayPrompts || []).length > 0)
    } else if (filters.essayRequired === 'no') {
      filteredResults = filteredResults.filter((x) => (x.s.essayPrompts || []).length === 0)
    }

    // Sort
    filteredResults.sort((a, b) => {
      switch (sort) {
        case 'match': return b.m.score - a.m.score
        case 'deadline': return new Date(a.s.deadline) - new Date(b.s.deadline)
        case 'amount': return b.s.amount.max - a.s.amount.max
        case 'newest': return new Date(b.s.opensOn) - new Date(a.s.opensOn)
        default: return 0
      }
    })

    return filteredResults
  }, [debouncedQuery, fuse, profile, filters, sort])

  // Quick chips
  const toggleQuickChip = useCallback((key) => {
    setFilters((f) => {
      const next = { ...f }
      if (key === 'closingSoon') next.deadlineWindow = f.deadlineWindow === '7' ? 'any' : '7'
      else if (key === 'highAmount') next.minAmount = f.minAmount > 0 ? 0 : 50
      else if (key === 'easyApply') next.difficulty = f.difficulty.includes('easy') ? f.difficulty.filter((d) => d !== 'easy') : [...f.difficulty, 'easy']
      else if (key === 'noEssay') next.essayRequired = f.essayRequired === 'no' ? 'any' : 'no'
      else if (key === 'renewable') next.renewableOnly = !f.renewableOnly
      else if (key === 'myField' && profile) next.fields = f.fields.includes(profile.fieldOfStudy) ? f.fields.filter((x) => x !== profile.fieldOfStudy) : [...f.fields, profile.fieldOfStudy]
      return next
    })
  }, [profile])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.levels.length) count += filters.levels.length
    if (filters.fields.length) count += filters.fields.length
    if (filters.types.length) count += filters.types.length
    if (filters.providerTypes.length) count += filters.providerTypes.length
    if (filters.countries.length) count += filters.countries.length
    if (filters.difficulty.length) count += filters.difficulty.length
    if (filters.minAmount > 0) count++
    if (filters.deadlineWindow !== 'any') count++
    if (filters.essayRequired !== 'any') count++
    return count
  }, [filters])

  function clearFilters() {
    setFilters({
      levels: [], fields: [], types: [], providerTypes: [], countries: [],
      minAmount: 0, maxAmount: 200, deadlineWindow: 'any', difficulty: [],
      essayRequired: 'any', eligibleOnly: true, minMatch: 0,
    })
  }

  function toggleArray(key, value) {
    setFilters((f) => ({
      ...f,
      [key]: f[key].includes(value)
        ? f[key].filter((v) => v !== value)
        : [...f[key], value],
    }))
  }

  const visible = filtered.slice(0, visibleCount)

  return (
    <div className="mx-auto max-w-content space-y-4">
      {/* Search bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search scholarships, providers, tags…"
            className="pl-10"
            aria-label="Search scholarships"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-subtle hover:text-ink"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button variant="secondary" size="md">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="jade" className="ml-1 px-1.5">{activeFilterCount}</Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 max-h-[70vh] overflow-y-auto p-4">
              {/* Filter controls */}
              <div className="space-y-4">
                {/* Eligible only */}
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium">Only show what I'm eligible for</span>
                  <Checkbox
                    checked={filters.eligibleOnly}
                    onCheckedChange={(v) => setFilters((f) => ({ ...f, eligibleOnly: !!v }))}
                  />
                </label>

                {/* Min match */}
                <div>
                  <span className="text-sm font-medium">Minimum match: {filters.minMatch}%</span>
                  <Slider value={[filters.minMatch]} onValueChange={([v]) => setFilters((f) => ({ ...f, minMatch: v }))} min={0} max={100} step={5} className="mt-2" />
                </div>

                {/* Education level */}
                <FilterGroup label="Education level">
                  {EDUCATION_LEVELS.map((l) => (
                    <FilterCheckbox key={l} label={EDUCATION_LABELS[l]} checked={filters.levels.includes(l)} onChange={() => toggleArray('levels', l)} />
                  ))}
                </FilterGroup>

                {/* Field */}
                <FilterGroup label="Field of study">
                  {FIELDS_OF_STUDY.map((f) => (
                    <FilterCheckbox key={f} label={f} checked={filters.fields.includes(f)} onChange={() => toggleArray('fields', f)} />
                  ))}
                </FilterGroup>

                {/* Type */}
                <FilterGroup label="Scholarship type">
                  {SCHOLARSHIP_TYPES.map((t) => (
                    <FilterCheckbox key={t} label={SCHOLARSHIP_TYPE_LABELS[t]} checked={filters.types.includes(t)} onChange={() => toggleArray('types', t)} />
                  ))}
                </FilterGroup>

                {/* Provider type */}
                <FilterGroup label="Provider type">
                  {PROVIDER_TYPES.map((p) => (
                    <FilterCheckbox key={p} label={PROVIDER_LABELS[p]} checked={filters.providerTypes.includes(p)} onChange={() => toggleArray('providerTypes', p)} />
                  ))}
                </FilterGroup>

                {/* Deadline window */}
                <div>
                  <span className="text-sm font-medium">Deadline window</span>
                  <Select value={filters.deadlineWindow} onValueChange={(v) => setFilters((f) => ({ ...f, deadlineWindow: v }))}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any time</SelectItem>
                      <SelectItem value="7">Within 7 days</SelectItem>
                      <SelectItem value="30">Within 30 days</SelectItem>
                      <SelectItem value="60">Within 60 days</SelectItem>
                      <SelectItem value="90">Within 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Difficulty */}
                <FilterGroup label="Difficulty">
                  {DIFFICULTY_LEVELS.map((d) => (
                    <FilterCheckbox key={d} label={DIFFICULTY_LABELS[d]} checked={filters.difficulty.includes(d)} onChange={() => toggleArray('difficulty', d)} />
                  ))}
                </FilterGroup>

                {/* Essay required */}
                <div>
                  <span className="text-sm font-medium">Essay required</span>
                  <Select value={filters.essayRequired} onValueChange={(v) => setFilters((f) => ({ ...f, essayRequired: v }))}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" className="w-full" onClick={clearFilters}>
                    Clear all filters
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="hidden items-center rounded-md border border-border sm:flex">
            <button
              onClick={() => setLayout('grid')}
              className={cn('rounded-l-md p-2', layout === 'grid' ? 'bg-jade-50 text-jade-600 dark:bg-jade-900/30 dark:text-jade-400' : 'text-ink-muted hover:bg-surface-2')}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setLayout('list')}
              className={cn('rounded-r-md p-2', layout === 'list' ? 'bg-jade-50 text-jade-600 dark:bg-jade-900/30 dark:text-jade-400' : 'text-ink-muted hover:bg-surface-2')}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick chips */}
      <div className="flex flex-wrap gap-2">
        {QUICK_CHIPS.map((chip) => {
          const active =
            (chip.key === 'closingSoon' && filters.deadlineWindow === '7') ||
            (chip.key === 'highAmount' && filters.minAmount > 0) ||
            (chip.key === 'easyApply' && filters.difficulty.includes('easy')) ||
            (chip.key === 'noEssay' && filters.essayRequired === 'no') ||
            (chip.key === 'myField' && profile && filters.fields.includes(profile.fieldOfStudy))
          return (
            <button
              key={chip.key}
              onClick={() => toggleQuickChip(chip.key)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                active
                  ? 'border-jade-600 bg-jade-50 text-jade-700 dark:bg-jade-900/30 dark:text-jade-300'
                  : 'border-border bg-surface text-ink-muted hover:bg-surface-2',
              )}
            >
              {chip.label}
            </button>
          )
        })}
      </div>

      {/* Result count + active filter chips */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted" aria-live="polite">
          {filtered.length} scholarship{filtered.length !== 1 ? 's' : ''} found
        </p>
        {recentSearches.length > 0 && !query && (
          <div className="hidden items-center gap-1 text-xs text-ink-subtle sm:flex">
            Recent: {recentSearches.slice(0, 3).map((s) => (
              <button key={s} onClick={() => setQuery(s)} className="rounded-full bg-surface-2 px-2 py-0.5 hover:bg-surface">{s}</button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      {visible.length === 0 ? (
        <EmptyState
          icon={<Search className="h-8 w-8" />}
          title="No scholarships found"
          description="Try relaxing your filters or search for something broader."
          action={activeFilterCount > 0 ? <Button onClick={clearFilters}>Clear all filters</Button> : undefined}
        />
      ) : (
        <div className={cn(
          'grid gap-4',
          layout === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-1',
        )}>
          {visible.map((item, i) => (
            <ScholarshipCard key={item.s.id} scholarship={item.s} index={i} layout={layout} />
          ))}
        </div>
      )}

      {/* Load more */}
      {visibleCount < filtered.length && (
        <div className="flex justify-center pt-4">
          <Button variant="secondary" onClick={() => setVisibleCount((c) => c + BATCH_SIZE)}>
            Load more ({filtered.length - visibleCount} remaining)
          </Button>
        </div>
      )}

      <CompareTray />
    </div>
  )
}

function FilterGroup({ label, children }) {
  return (
    <div>
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-1.5 space-y-1.5">
        {children}
      </div>
    </div>
  )
}

function FilterCheckbox({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <Checkbox checked={checked} onCheckedChange={onChange} />
      <span className="text-sm text-ink-muted">{label}</span>
    </label>
  )
}
