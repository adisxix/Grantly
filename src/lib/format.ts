import { CURRENCY_SYMBOLS, CURRENCY_RATES } from '@/data/constants'

/**
 * Format an amount in a given currency with locale grouping.
 * @param {number} amount
 * @param {string} currency - 'INR' | 'USD' | 'EUR' | 'GBP'
 * @returns {string}
 */
export function formatCurrency(amount, currency = 'INR') {
  const symbol = CURRENCY_SYMBOLS[currency] || ''
  try {
    const locale =
      currency === 'INR' ? 'en-IN' : currency === 'USD' ? 'en-US' : currency === 'EUR' ? 'de-DE' : 'en-GB'
    const formatted = new Intl.NumberFormat(locale, {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(amount)
    return `${symbol}${formatted}`
  } catch {
    return `${symbol}${Math.round(amount).toLocaleString()}`
  }
}

/**
 * Format an INR amount with Indian short forms (₹4.2L, ₹1.5Cr).
 * @param {number} amount
 * @returns {string}
 */
export function formatINRShort(amount) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1).replace('.0', '')}Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1).replace('.0', '')}L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}k`
  return `₹${amount}`
}

/**
 * Convert an amount from one currency to another using static rates.
 * @param {number} amount
 * @param {string} from
 * @param {string} to
 * @returns {number}
 */
export function convertCurrency(amount, from, to) {
  const inUSD = amount / (CURRENCY_RATES[from] || 1)
  return inUSD * (CURRENCY_RATES[to] || 1)
}

/**
 * Format a scholarship amount range with cadence.
 * @param {{ min: number, max: number, currency: string, cadence: string }} amount
 * @returns {string}
 */
export function formatAmount(amount) {
  if (!amount) return ''
  const { min, max, currency, cadence } = amount
  let range
  if (min === max) {
    range = formatCurrency(max, currency)
  } else {
    range = `${formatCurrency(min, currency)} – ${formatCurrency(max, currency)}`
  }
  if (cadence === 'annual') range += '/yr'
  else if (cadence === 'monthly') range += '/mo'
  return range
}

/**
 * Format a relative deadline like "in 6 days" with urgency tier.
 * @param {string} iso
 * @returns {{ label: string, tier: 'overdue'|'urgent'|'soon'|'comfortable', days: number }}
 */
export function formatDeadline(iso) {
  const days = Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (days < 0) return { label: `${Math.abs(days)}d ago`, tier: 'overdue', days }
  if (days === 0) return { label: 'Today', tier: 'urgent', days: 0 }
  if (days === 1) return { label: 'Tomorrow', tier: 'urgent', days: 1 }
  if (days <= 7) return { label: `in ${days}d`, tier: 'urgent', days }
  if (days <= 21) return { label: `in ${days}d`, tier: 'soon', days }
  return { label: `in ${days}d`, tier: 'comfortable', days }
}

/**
 * Format an ISO date as a readable date.
 * @param {string} iso
 * @param {string} [style] - 'medium' | 'short'
 * @returns {string}
 */
export function formatDate(iso, style = 'medium') {
  const d = new Date(iso)
  if (style === 'short') {
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

/**
 * Format bytes into a human-readable size.
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 / 1024)).toFixed(1)} MB`
}

/**
 * Count words in an HTML string.
 * @param {string} html
 * @returns {number}
 */
export function countWords(html) {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim()
  if (!text) return 0
  return text.split(/\s+/).length
}

/**
 * Estimate reading time in minutes.
 * @param {number} words
 * @returns {number}
 */
export function readingTime(words) {
  return Math.max(1, Math.round(words / 200))
}
