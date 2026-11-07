import { cn } from '@/lib/utils'

const COLOURS = [
  'bg-jade-600', 'bg-gold-500', 'bg-info', 'bg-coral', 'bg-success',
]

/**
 * Initials avatar with deterministic colour.
 * @param {{ name: string, size?: number, className?: string }} props
 */
export function Avatar({ name, size = 40, className }) {
  const initials = (name || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  const hash = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const colour = COLOURS[hash % COLOURS.length]
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold text-white',
        colour,
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-label={name}
      role="img"
    >
      {initials}
    </span>
  )
}
