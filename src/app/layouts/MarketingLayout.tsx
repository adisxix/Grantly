import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { GraduationCap, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProfileStore } from '@/store/useProfileStore'
import { cn } from '@/lib/utils'

export function MarketingLayout() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const hasProfile = useProfileStore((s) => !!s.profile)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how' },
    { label: 'Learn', href: '#learn' },
  ]

  return (
    <div className="min-h-screen bg-paper">
      <a href="#main" className="skip-link">Skip to content</a>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-200',
          scrolled ? 'glass shadow-soft' : 'bg-transparent',
        )}
      >
        <nav className="mx-auto flex h-16 max-w-content items-center justify-between px-4 md:px-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-jade-600">
              <GraduationCap className="h-5 w-5 text-gold-400" />
            </span>
            <span className="font-display text-xl font-bold text-ink">Grantly</span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-ink-muted transition-colors hover:text-ink"
              >
                {l.label}
              </a>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                document.getElementById('demo-cta')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Explore demo
            </Button>
            <Button size="sm" onClick={() => navigate(hasProfile ? '/app/dashboard' : '/onboarding')}>
              Get started
            </Button>
          </div>

          <button
            className="rounded-md p-2 text-ink md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {menuOpen && (
          <div className="glass border-t border-border px-4 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-medium text-ink-muted hover:text-ink"
                >
                  {l.label}
                </a>
              ))}
              <Button
                size="sm"
                className="mt-2"
                onClick={() => navigate(hasProfile ? '/app/dashboard' : '/onboarding')}
              >
                Get started
              </Button>
            </div>
          </div>
        )}
      </header>

      <main id="main">
        <Outlet />
      </main>
    </div>
  )
}
