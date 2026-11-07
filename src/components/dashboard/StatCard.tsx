import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

function CountUp({ end, duration = 1000 }) {
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

/**
 * Dashboard stat card with count-up number, icon, and optional sparkline.
 * @param {{ icon: React.ReactNode, label: string, value: number, prefix?: string, suffix?: string, colour?: string, trend?: number[], index?: number }} props
 */
export function StatCard({ icon, label, value, prefix = '', suffix = '', colour = 'jade', trend, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <div className="card-base rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg', `bg-${colour}-50 dark:bg-${colour}-900/20 text-${colour}-600 dark:text-${colour}-400`)} style={{ color: { jade: '#0E7C66', gold: '#D99A1C', coral: '#E8625A', info: '#2563A8' }[colour] }}>
            {icon}
          </span>
          {trend && (
            <svg width="56" height="24" className="opacity-60">
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                points={trend.map((v, i) => `${(i / (trend.length - 1)) * 56},${24 - (v / Math.max(...trend)) * 22}`).join(' ')}
                className="text-ink-subtle"
              />
            </svg>
          )}
        </div>
        <p className="mt-2 font-display text-2xl font-bold tabular-nums">
          {prefix}
          <CountUp end={value} />
          {suffix}
        </p>
        <p className="text-xs text-ink-muted">{label}</p>
      </div>
    </motion.div>
  )
}
