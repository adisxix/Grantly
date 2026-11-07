import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense, type ReactNode } from 'react'
import { AppShell } from '@/app/layouts/AppShell'
import { MarketingLayout } from '@/app/layouts/MarketingLayout'
import { useProfileStore } from '@/store/useProfileStore'
import { PageLoader } from '@/components/layout/PageLoader'
import { RouteErrorFallback } from '@/components/layout/RouteErrorFallback'

type RouteElement = { children: ReactNode }

const Landing = lazy(() => import('@/pages/Landing'))
const Onboarding = lazy(() => import('@/pages/Onboarding'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Discover = lazy(() => import('@/pages/Discover'))
const ScholarshipDetail = lazy(() => import('@/pages/ScholarshipDetail'))
const Tracker = lazy(() => import('@/pages/Tracker'))
const Calendar = lazy(() => import('@/pages/Calendar'))
const Documents = lazy(() => import('@/pages/Documents'))
const Essays = lazy(() => import('@/pages/Essays'))
const EssayEditor = lazy(() => import('@/pages/EssayEditor'))
const Planner = lazy(() => import('@/pages/Planner'))
const Insights = lazy(() => import('@/pages/Insights'))
const Learn = lazy(() => import('@/pages/Learn'))
const LearnArticle = lazy(() => import('@/pages/LearnArticle'))
const Settings = lazy(() => import('@/pages/Settings'))
const NotFound = lazy(() => import('@/pages/NotFound'))

const withSuspense = (el: ReactNode) => (
  <Suspense fallback={<PageLoader />}>{el}</Suspense>
)

/** Guard that redirects to onboarding if no profile exists. */
function requireProfile({ children }: RouteElement) {
  const hasProfile = useProfileStore.getState().hasProfile()
  if (!hasProfile) return <Navigate to="/onboarding" replace />
  return children
}

export const router = createBrowserRouter([
  {
    element: <MarketingLayout />,
    errorElement: <RouteErrorFallback />,
    children: [
      { path: '/', element: withSuspense(<Landing />) },
    ],
  },
  {
    path: '/onboarding',
    element: withSuspense(<Onboarding />),
    errorElement: <RouteErrorFallback />,
  },
  {
    element: <AppShell />,
    errorElement: <RouteErrorFallback />,
    children: [
      { path: '/app', element: <Navigate to="/app/dashboard" replace /> },
      { path: '/app/dashboard', element: withSuspense(requireProfile({ children: <Dashboard /> })) },
      { path: '/app/discover', element: withSuspense(requireProfile({ children: <Discover /> })) },
      { path: '/app/scholarship/:id', element: withSuspense(requireProfile({ children: <ScholarshipDetail /> })) },
      { path: '/app/tracker', element: withSuspense(requireProfile({ children: <Tracker /> })) },
      { path: '/app/calendar', element: withSuspense(requireProfile({ children: <Calendar /> })) },
      { path: '/app/documents', element: withSuspense(requireProfile({ children: <Documents /> })) },
      { path: '/app/essays', element: withSuspense(requireProfile({ children: <Essays /> })) },
      { path: '/app/essays/:id', element: withSuspense(requireProfile({ children: <EssayEditor /> })) },
      { path: '/app/planner', element: withSuspense(requireProfile({ children: <Planner /> })) },
      { path: '/app/insights', element: withSuspense(requireProfile({ children: <Insights /> })) },
      { path: '/app/learn', element: withSuspense(requireProfile({ children: <Learn /> })) },
      { path: '/app/learn/:slug', element: withSuspense(requireProfile({ children: <LearnArticle /> })) },
      { path: '/app/settings', element: withSuspense(requireProfile({ children: <Settings /> })) },
    ],
  },
  { path: '*', element: withSuspense(<NotFound />) },
])
