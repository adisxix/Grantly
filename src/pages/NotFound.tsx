import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { GraduationCap } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-paper px-4 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-jade-600">
        <GraduationCap className="h-8 w-8 text-gold-400" />
      </span>
      <div>
        <h1 className="font-display text-5xl font-bold text-ink">404</h1>
        <p className="mt-2 text-ink-muted">This page doesn't exist — but there are plenty of scholarships that do.</p>
      </div>
      <div className="flex gap-3">
        <Button onClick={() => navigate('/')}>Go home</Button>
        <Button variant="secondary" onClick={() => navigate('/app/discover')}>Discover scholarships</Button>
      </div>
    </div>
  )
}
