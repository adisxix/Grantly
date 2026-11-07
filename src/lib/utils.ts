import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind classes with conditional logic.
 * @param  {...any} inputs
 * @returns {string}
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Generate a short unique id.
 * @returns {string}
 */
export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

/**
 * Clamp a number between min and max.
 * @param {number} n
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max)
}

/**
 * Compute the number of days between two dates (rounded).
 * @param {Date|string} from
 * @param {Date|string} to
 * @returns {number}
 */
export function daysBetween(from, to) {
  const a = new Date(from)
  const b = new Date(to)
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

/**
 * Check if an ISO date is in the past.
 * @param {string} iso
 * @returns {boolean}
 */
export function isPastDeadline(iso) {
  return new Date(iso).getTime() < Date.now()
}

/**
 * Simple deep clone via JSON (safe for our plain data).
 * @template T
 * @param {T} obj
 * @returns {T}
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Pluralize a word.
 * @param {number} n
 * @param {string} word
 * @param {string} [plural]
 * @returns {string}
 */
export function plural(n, word, plural = word + 's') {
  return n === 1 ? word : plural
}
