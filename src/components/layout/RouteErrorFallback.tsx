import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function RouteErrorFallback() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error)
    ? error.status === 404
      ? 'The page you requested could not be found.'
      : 'This page could not be loaded right now.'
    : 'An unexpected error occurred while loading this page.'

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6 py-16">
      <section className="flex max-w-md flex-col items-center gap-4 text-center" role="alert">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-50 text-gold-700">
          <AlertTriangle aria-hidden="true" className="h-7 w-7" />
        </span>
        <h1 className="font-display text-3xl font-semibold">We hit a snag</h1>
        <p className="text-ink-muted">{message}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={() => window.location.reload()}>Reload page</Button>
          <Button asChild variant="secondary">
            <Link to="/">Return home</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
