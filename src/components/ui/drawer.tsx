import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Drawer = DialogPrimitive.Root
export const DrawerTrigger = DialogPrimitive.Trigger

export function DrawerContent({ className, children, side = 'right', ...props }) {
  const sideClasses =
    side === 'right'
      ? 'fixed inset-y-0 right-0 z-50 h-full w-full max-w-md border-l border-border bg-surface shadow-lift'
      : 'fixed inset-x-0 bottom-0 z-50 max-h-[90vh] w-full rounded-t-xl border-t border-border bg-surface shadow-lift'
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      />
      <DialogPrimitive.Content
        className={cn(
          sideClasses,
          'overflow-y-auto data-[state=open]:animate-in data-[state=closed]:animate-out',
          side === 'right'
            ? 'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right'
            : 'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-md p-1 text-ink-muted hover:bg-surface-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export function DrawerHeader({ className, ...props }) {
  return <div className={cn('mb-4 space-y-1 border-b border-border pb-4 pr-8', className)} {...props} />
}

export function DrawerTitle({ className, ...props }) {
  return (
    <DialogPrimitive.Title className={cn('font-display text-xl font-semibold', className)} {...props} />
  )
}

export function DrawerDescription({ className, ...props }) {
  return (
    <DialogPrimitive.Description className={cn('text-sm text-ink-muted', className)} {...props} />
  )
}
