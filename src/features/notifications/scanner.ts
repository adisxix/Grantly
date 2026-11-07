import { useNotificationStore } from '@/store/useNotificationStore'
import { useApplicationStore } from '@/store/useApplicationStore'
import { getScholarship } from '@/data/scholarships'
import { daysBetween } from '@/lib/utils'

/**
 * Scan applications and deadlines, generating notifications at 7, 3, 1 and 0 days
 * before a deadline. Safe to call on load — dedupes by title+kind.
 */
export function scanDeadlineNotifications() {
  const { applications } = useApplicationStore.getState()
  const { notifications, addNotification } = useNotificationStore.getState()
  const existingKeys = new Set(notifications.map((n) => `${n.kind}:${n.title}`))

  for (const app of applications) {
    const s = getScholarship(app.scholarshipId)
    if (!s) continue
    const days = daysBetween(Date.now(), s.deadline)

    // Only notify for these thresholds
    const thresholds = [7, 3, 1, 0]
    if (!thresholds.includes(days)) continue

    // Skip if already awarded/rejected
    if (app.status === 'awarded' || app.status === 'rejected') continue

    const key = `deadline:${s.name}:${days}d`
    if (existingKeys.has(key)) continue

    let title
    let body
    if (days === 0) {
      title = `Deadline today: ${s.name}`
      body = 'Submit your application before it closes.'
    } else if (days === 1) {
      title = `Deadline tomorrow: ${s.name}`
      body = 'Last chance to submit your application.'
    } else {
      title = `${days} days left: ${s.name}`
      body = 'Start preparing your application materials.'
    }

    addNotification({
      kind: 'deadline',
      title,
      body,
      href: `/app/scholarship/${s.slug}`,
    })
    existingKeys.add(key)
  }
}
