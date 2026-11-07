import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none',
  {
    variants: {
      variant: {
        primary: 'bg-jade-600 text-white hover:bg-jade-700 active:bg-jade-800 shadow-soft',
        cta: 'bg-gold-500 text-ink hover:bg-gold-600 active:bg-gold-700 shadow-soft font-semibold',
        secondary: 'border border-border bg-surface text-ink hover:bg-surface-2',
        ghost: 'text-ink-muted hover:bg-surface-2 hover:text-ink',
        danger: 'bg-danger text-white hover:brightness-110 active:brightness-95',
        outline: 'border border-jade-600 text-jade-700 dark:text-jade-300 hover:bg-jade-50 dark:hover:bg-jade-900/30',
      },
      size: {
        sm: 'h-9 px-3 text-sm rounded-md',
        md: 'h-11 px-5 text-sm rounded-md',
        lg: 'h-12 px-7 text-base rounded-md',
        icon: 'h-10 w-10 rounded-md',
        iconSm: 'h-8 w-8 rounded-md',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export const Button = forwardRef(function Button(
  { className, variant, size, asChild, ...props },
  ref,
) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : 'button'}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
})
