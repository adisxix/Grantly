/**
 * @file JSDoc typedefs for editor hints. No runtime code here.
 * Enum values live as exported arrays in src/data/constants.ts
 */

/**
 * @typedef {Object} Scholarship
 * @property {string} id
 * @property {string} slug
 * @property {string} name
 * @property {string} provider
 * @property {'government'|'corporate'|'university'|'ngo'|'foundation'} providerType
 * @property {string} description
 * @property {boolean} [featured]
 * @property {string[]} tags
 * @property {{ min: number, max: number, currency: 'INR'|'USD'|'EUR'|'GBP', cadence: 'one_time'|'annual'|'monthly', renewable: boolean }} amount
 * @property {string} opensOn
 * @property {string} deadline
 * @property {string[]} types
 * @property {string[]} levels
 * @property {string[]} fields
 * @property {string[]} countries
 * @property {string[]} [states]
 * @property {number} [minGpaPercent]
 * @property {number} [maxFamilyIncomeINR]
 * @property {string[]} [genders]
 * @property {string[]} [categories]
 * @property {boolean} [requiresDisability]
 * @property {number} [maxAge]
 * @property {string[]} documentsRequired
 * @property {{ id: string, prompt: string, maxWords: number }[]} [essayPrompts]
 * @property {string[]} steps
 * @property {{ q: string, a: string }[]} faqs
 * @property {'easy'|'moderate'|'competitive'} difficulty
 * @property {number} estimatedMinutes
 * @property {number} awardsCount
 * @property {string} website
 */

/**
 * @typedef {Object} StudentProfile
 * @property {string} id
 * @property {string} fullName
 * @property {string} [email]
 * @property {string} dob
 * @property {string} gender
 * @property {string} country
 * @property {string} state
 * @property {string} educationLevel
 * @property {string} fieldOfStudy
 * @property {string} institution
 * @property {number} yearOfStudy
 * @property {number} gpaPercent
 * @property {number} familyIncomeINR
 * @property {string} category
 * @property {boolean} firstGen
 * @property {boolean} hasDisability
 * @property {string[]} interests
 * @property {string} goals
 * @property {boolean} onboardingComplete
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Application
 * @property {string} id
 * @property {string} scholarshipId
 * @property {string} status
 * @property {string} notes
 * @property {{ id: string, label: string, done: boolean, docType?: string }[]} checklist
 * @property {string[]} documentIds
 * @property {string[]} essayIds
 * @property {number[]} reminders
 * @property {number} [amountAwarded]
 * @property {string} [submittedAt]
 * @property {string} [confirmationNo]
 * @property {string} updatedAt
 * @property {{ at: string, text: string }[]} activity
 */

/**
 * @typedef {Object} VaultDocument
 * @property {string} id
 * @property {string} name
 * @property {string} type
 * @property {number} size
 * @property {string} mime
 * @property {string} uploadedAt
 * @property {string} [expiresAt]
 * @property {string[]} tags
 * @property {string} blobKey
 */

/**
 * @typedef {Object} Essay
 * @property {string} id
 * @property {string} title
 * @property {string} [scholarshipId]
 * @property {string} [promptId]
 * @property {string} html
 * @property {number} [wordLimit]
 * @property {{ at: string, html: string }[]} versions
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} AppNotification
 * @property {string} id
 * @property {'deadline'|'status'|'tip'|'system'} kind
 * @property {string} title
 * @property {string} body
 * @property {string} at
 * @property {boolean} read
 * @property {string} [href]
 */

/**
 * @typedef {Object} Settings
 * @property {'light'|'dark'|'system'} theme
 * @property {string} currency
 * @property {'sm'|'md'|'lg'} textSize
 * @property {boolean} reduceMotion
 * @property {boolean} highContrast
 * @property {boolean} browserNotifications
 * @property {number[]} reminderDays
 */

/** @typedef {{ score: number, verdict: 'eligible'|'partial'|'ineligible', criteria: CriterionResult[], reasons: string[], gaps: string[] }} MatchResult */

/** @typedef {{ key: string, label: string, status: 'met'|'partial'|'unmet'|'unknown', weight: number, text: string, fix?: string }} CriterionResult */
