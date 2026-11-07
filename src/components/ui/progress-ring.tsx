import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const COLOURS = {
  excellent: '#0E7C66',
  good: '#F5B83D',
  partial: '#64748B',
  ineligible: '#E8625A',
}

/**
 * Animated circular progress ring showing a 0-100 score.
 * @param {{ value: number, size?: number, stroke?: number, colour?: string, tier?: string, label?: string, sublabel?: string, className?: string }} props
 */
export function ProgressRing({
  value,
  size = 64,
  stroke = 6,
  colour,
  tier = 'good',
  label,
  sublabel,
  className,
}) {
  const [animated, setAnimated] = useState(0)
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, value))
  const offset = circumference - (animated / 100) * circumference
  const strokeColour = colour || COLOURS[tier] || COLOURS.good

  useEffect(() => {
    const prefersReduced =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      setAnimated(clamped)
      return
    }
    const t = requestAnimationFrame(() => setAnimated(clamped))
    return () => cancelAnimationFrame(t)
  }, [clamped])

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-surface-2"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          stroke={strokeColour}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {label ?? (
          <>
            <span
              className="font-mono font-bold tabular-nums leading-none"
              style={{ fontSize: size * 0.28, color: strokeColour }}
            >
              {Math.round(clamped)}
            </span>
            {sublabel && (
              <span
                className="text-[9px] font-medium uppercase tracking-wide text-ink-subtle leading-none mt-0.5"
              >
                {sublabel}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  )
}
