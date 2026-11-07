import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export const Card = forwardRef(function Card({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn('card-base rounded-lg p-5', className)}
      {...props}
    />
  )
})

export function CardHeader({ className, ...props }) {
  return <div className={cn('mb-4 space-y-1', className)} {...props} />
}

export function CardTitle({ className, ...props }) {
  return <h3 className={cn('font-display text-lg font-semibold', className)} {...props} />
}

export function CardDescription({ className, ...props }) {
  return <p className={cn('text-sm text-ink-muted', className)} {...props} />
}

export function CardContent({ className, ...props }) {
  return <div className={cn('', className)} {...props} />
}

export function CardFooter({ className, ...props }) {
  return <div className={cn('mt-4 flex items-center gap-2', className)} {...props} />
}
