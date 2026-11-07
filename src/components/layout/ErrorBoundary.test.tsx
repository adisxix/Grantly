import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ErrorBoundary } from './ErrorBoundary'

function ThrowingChild() {
  throw new Error('test failure')
}

describe('ErrorBoundary', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders a recovery action when a child throws', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    )

    expect(screen.getByRole('alert').textContent).toContain('Something went wrong')
    expect(screen.getByRole('button', { name: 'Reload' })).toBeTruthy()
  })
})
